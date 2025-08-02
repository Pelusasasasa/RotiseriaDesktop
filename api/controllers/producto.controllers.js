const productoCTRL = {};

const { cloudinary } = require('../helpers/cargarImagenCloudinary');
const validarId = require('../helpers/validarId');
const Producto = require('../models/Producto');
const ProductoAtlas = require('../models/ProductoAtlas');
const SyncPendiente = require('../models/SyncPendiente');

productoCTRL.deleteOne = async(req, res) => {
    const { id } = req.params;
    try {

        if(await validarId(id)) return res.status(400).json({
            ok: false,
            msg: 'El id no es valido'
        });

        const productoEliminado = await Producto.findByIdAndDelete(id);
        
        if(!productoEliminado) return res.status(404).json({
            ok: false,
            msg: 'No se encontró el producto'
        });

        //Ejecutamos para eliminar de la base de datos de mongodb Atlas
        try {
            const productoAtlasEliminado = await ProductoAtlas.findByIdAndDelete(id);
            if(!productoAtlasEliminado){
                await new SyncPendiente({
                    tipo: 'producto',
                    data: id,
                    peticion: 'DELETE'
                }).save();
            }else{
                console.log(`Producto ${productoAtlasEliminado.descripcion} Eliminado de MongoDB atlas`);
            } 
        } catch (error) {
            await new SyncPendiente({
                tipo: 'producto',
                data: id,
                peticion: 'DELETE'
            }).save();
        };

        console.log(`Producto ${productoEliminado.descripcion} Eliminado de MongoDB Local`);
        res.status(200).json({
            ok: true,
            productoEliminado
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo eliminar el producto, hable con el administrador'
        })
    }
};

productoCTRL.descontarStock = async(req, res) => {
    const productosModificados = [];
    try {
        for await(let producto of req.body){
            delete producto.precio;
    
            const productoModificado = await Producto.findByIdAndUpdate(producto._id, producto, {new : true})

            productosModificados.push(productoModificado);
        };

        res.status(200).json({
            ok: true,
            productosModificados
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo descontar el stock, hable con el administrador'
        });
    }
};

productoCTRL.getAll = async(req, res) => {
    try {
        const productos = await Producto.find().populate('seccion', ['nombre', 'codigo']);

        res.status(200).json({
            ok: true,
            productos
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudieron obtener los datos de productos, hable con el administrador'
        })
    }
};

productoCTRL.getForSeccion = async(req, res) => {
    const { seccion } = req.params;

    try {
        const productos = await Producto.find({seccion}).populate('seccion', ['nombre', 'codigo']);

        if(!productos) return res.status(404).json({
            ok: false,
            msg: 'No se encontraron productos para esta seccion'
        });

        res.status(200).json({
            ok: true,
            productos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudieron obtener los datos de productos, hable con el administrador'
        })
    }
};

productoCTRL.getForSeccionAndDescription = async(req, res) => {
    const {description, seccion} = req.params;

    try {
        let productos = [];

        if(description === 'textoVacio'){
            productos = await Producto.find().populate('seccion', ['codigo', 'nombre']);
        }else{
            let re;
            if (description[0] === '*'){
                re = new RegExp(`${description.substr(1)}`);
            }else{
                re = new RegExp(`${description}`);
            };

            productos = await Producto.find({ [seccion]: {$regex: re, $options: 'i' }}).populate('seccion', ['codigo', 'nombre']);
        };

        if(!productos.length === 0) return res.status(404).json({
            ok: false,
            msg: 'No se obtuvieron productos'
        });

        res.status(200).json({
            ok: true,
            productos
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener los productos, hable con el administrador'
        })
    }
};  

productoCTRL.getOne = async(req, res) => {
    const { id } = req.params;

    try {
        const producto = await Producto.findById(id).populate('seccion', ['codigo', 'nombre'])

        if(!producto) return res.status(404).json({
            ok: false,
            msg: 'No se encontró el producto'
        });

        res.status(200).json({
            ok: true,
            producto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo obtener el producto, hable con el administrador'
        })
    }
};

productoCTRL.patchPrecio = async(req, res) => {
    const { id } = req.params;
    const datos = req.body;
    try {
        if(await validarId(id)) return res.status(400).json({
            ok: false,
            msg: 'El id no es valido'
        });
        const newProducto = await Producto.findOneAndUpdate({_id: id}, datos, {new: true});

        //Ejecutamos para modificar los productos que estan en Mongo DB Atlas
        try {
            const newPrecioAtlas = await ProductoAtlas.findOneAndUpdate({_id: id}, datos, {new: true});
            if(!newPrecioAtlas){
                await new SyncPendiente({
                    tipo: 'producto',
                    data: datos,
                    peticion: 'PATCH'
                }).save();
            }else{
                console.log(`Producto ${newPrecioAtlas.descripcion} Modificado en MongoDB Atlas`);
            }
        } catch (error) {
            console.log(error)
            await new SyncPendiente({
                tipo: 'producto',
                data: datos,
                peticion: 'PATCH'
            }).save();
        }


        res.status(200).json({
            ok: true,
            newProducto
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo modificar el precio, hable con el administraor'
        })
    }
};

productoCTRL.postOne = async(req, res) => {
    try {

        //Ejecutamos para guardar el producto en Cloudinary la imagen
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Sabor-Urbano'
        });
        req.body.imgCloudinaryPath = result.url;

        const producto = new Producto(req.body);
        await producto.save();

        //Ejecutamos para guardar el producto en MongoDB Atlas
        try {
            const nuevoProductoAtlas = new ProductoAtlas(req.body);
            await nuevoProductoAtlas.save();
            console.log(`Producto ${nuevoProductoAtlas.descripcion} Guardado en MongoDB Atlas`);
        } catch (error) {
            console.error(error);
            await new SyncPendiente({
                tipo: 'producto',
                data: req.body,
                peticion: 'POST'
            }).save();
        }

        

        console.log(`Producto ${producto.descripcion} Guardado en MongoDB Local`);
        res.status(201).json({
            ok: true,
            producto
        });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo crear el producto, hable con el administrador'
        })
    }
};

productoCTRL.patchOne = async(req, res) => {
    const { id } = req.params;

    try {
        //Ejecutamos para guardar el producto en Cloudinary la imagen
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Sabor-Urbano'
        });
        req.body.imgCloudinaryPath = result.url;
        
        const productoModificado = await Producto.findOneAndUpdate({_id: id}, req.body, {new: true});

        if(!productoModificado) return res.status(404).json({
            ok: false,
            msg: 'No se encontro el producto'
        });

        try {
            const productoModificadoAtlas = await ProductoAtlas.findOneAndUpdate({_id: id}, req.body, {new: true});
            if(!productoModificadoAtlas){
                await new SyncPendiente({
                    tipo: 'producto',
                    data: req.body,
                    peticion: 'PATCH'
                }).save();
            }else{
                console.log(`Producto ${productoModificadoAtlas.descripcion} Modificado en MongoDB Atlas`);
            }
        } catch (error) {
            await new SyncPendiente({
                tipo: 'producto',
                data: req.body,
                peticion: 'PATCH'
            }).save();
        };
        
        console.log(`Producto ${productoModificado.descripcion} Modificado en MongoDB Local`);
        res.status(200).json({
            ok: true,
            productoModificado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo modificar el producto, hable con el administrador'
        })
    }
};  

module.exports = productoCTRL;