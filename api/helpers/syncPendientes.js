const CartaEmpanada = require('../models/CartaEmpanada');
const ProductoAtlas = require('../models/ProductoAtlas');
const SeccionAtlas = require('../models/SeccionAtlas');
const SyncPendiente = require('../models/SyncPendiente');

const ejecutarSeccion = async(item) => {
    if(item.peticion === 'DELETE'){
        try {
            const seccionEliminada = await SeccionAtlas.findOneAndDelete({codigo: item.data});

            if(seccionEliminada){
                console.log(`Seccion Pendiente ${seccionEliminada.nombre} eliminada`);
                await SyncPendiente.findByIdAndDelete(item._id);
            }
        } catch (error) {
            console.log(error);
        }
    };

    if(item.peticion === 'POST'){
        try {
            const seccion = new SeccionAtlas(item.data);
            await seccion.save();

            console.log(`Seccion Pendiente ${seccion.nombre} creada`);
            await SyncPendiente.findByIdAndDelete(item._id);
        } catch (error) {
            console.log(error);
        }
    };

    if(item.peticion === 'PATCH'){
        try {
            const seccion = await SeccionAtlas.findOneAndUpdate({codigo: item.data.codigo}, item.data, {new: true});

            if(seccion){
                console.log(`Seccion Pendiente ${seccion.nombre} actualizada`);
                await SyncPendiente.findByIdAndDelete(item._id);
            }
        } catch (error) {
            console.log(error);
        }
    };
};

const ejecutarProducto = async(item) => {
    if(item.peticion === 'DELETE'){
        try {
            const productoEliminado = await ProductoAtlas.findByIdAndDelete(item.data);

            if(productoEliminado){
                console.log(`Producto Pendiente ${productoEliminado.descripcion} Eliminado en Mongo Atlas`);
                await SyncPendiente.findByIdAndDelete(item._id);
            };
        } catch (error) {
            console.log(error)
        }
    };

    if(item.peticion === 'POST'){
        try {
            const producto = new ProductoAtlas(item.data);
            await producto.save();

            console.log(`Producto Pendiente ${producto.descripcion} cargado`);
            await SyncPendiente.findByIdAndDelete(item._id);
        } catch (error) {
            console.log(error);
        }
    };

    if(item.peticion === 'PATCH'){
        try {
            const producto = await ProductoAtlas.findByIdAndUpdate(item.data._id, item.data, {new: true});

            if(producto){
                console.log(`Producto Pendiente ${producto.descripcion} actualizado`);
                await SyncPendiente.findByIdAndDelete(item._id);
            }
        } catch (error) {
            console.log(error);
        }
    };
};

const ejecturaVenta = async(item) => {
    if(item.peticion === 'PATCH'){
        try {
            const ventaActualizada = await VentaAtlas.findByIdAndUpdate(item.data, {pasado: true}, {new: true});

            console.log(`Venta Pendiente a cliente ${ventaActualizada.cliente} Actualizada`);
            await SyncPendiente.findByIdAndDelete(item._id);
        } catch (error) {
            console.log(error);
        }
    }
};

const ejecutarCartaEmpanada = async(item) => {
    
    if(item.peticion === 'PATCH'){
        try {
            delete item.data._id;
            await CartaEmpanada.findOneAndUpdate({}, item.data, {new: true});

            console.log(`Carta Empanada Pendiente Actualizada`);
            await SyncPendiente.findByIdAndDelete(item._id);
        } catch (error) {
            console.log(error)
        }
    }
};

//Los pendientes son documentos que no se hicireorn por algun error en la conexion a la base de datos atlas
const procesarPendientes = async() => {

    try {
        const pendientes = await SyncPendiente.find();

        if(pendientes.length === 0) return;

        for(let item of pendientes){
            if(item.tipo === 'seccion'){
                await ejecutarSeccion(item);
            }else if(item.tipo === 'producto'){
                ejecutarProducto(item);
            }else if(item.tipo === 'venta'){
                ejecturaVenta(item);
            }else if(item.tipo === 'carta'){
                ejecutarCartaEmpanada(item);    
            }
        }

    } catch (error) {
        console.log(error);
    }


};

module.exports = {
    procesarPendientes
};

