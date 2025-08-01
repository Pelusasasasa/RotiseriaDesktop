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


//Todo EjecturaProducto

//Todo EjecutarVenta

const procesarPendientes = async() => {

    try {
        const pendientes = await SyncPendiente.find();

        if(pendientes.length === 0) return;

        for(let item of pendientes){
            if(item.tipo === 'seccion'){
                await ejecutarSeccion(item)
            }


        }

    } catch (error) {
        console.log(error);
    }


};

module.exports = {
    procesarPendientes
};

