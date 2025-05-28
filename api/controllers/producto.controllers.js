const productoCTRL = {};

const validarId = require('../helpers/validarId');
const Producto = require('../models/Producto');

productoCTRL.deleteOne = async(req, res) => {
    const { id } = req.params;
    console.log(id);
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

        res.status(200).json({
            ok: true,
            productoEliminado
        })
    } catch (error) {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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

        res.status(200).json({
            ok: true,
            newProducto
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo modificar el precio, hable con el administraor'
        })
    }
};

productoCTRL.postOne = async(req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
        
        const producto = new Producto(req.body);
        await producto.save();

        res.status(201).json({
            ok: true,
            producto
        });

        
    } catch (error) {
        console.log(error);
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
        const productoModificado = await Producto.findOneAndUpdate({_id: id}, req.body, {new: true});

        if(!productoModificado) return res.status(404).json({
            ok: false,
            msg: 'No se encontro el producto'
        });
        
        res.status(200).json({
            ok: true,
            productoModificado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo modificar el producto, hable con el administrador'
        })
    }
};  

module.exports = productoCTRL;