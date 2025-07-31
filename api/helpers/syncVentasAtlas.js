const Venta = require("../models/Venta");
const VentaAtlasModel = require("../models/VentaAtlas.model");
const getNextNumberContado = require("./getNextNumberContado");

const syncVentas = async() => {
    console.log('Ejecutado');
    try {
        const ventasPendientes = await VentaAtlasModel.find({pasado: false});

        if(ventasPendientes.length > 0){
            for(let venta of ventasPendientes){
                const ventaData = venta.toObject();
                
                //Eliminar _id para que mongodb genere uno nuevo
                delete venta._id;
                const numero = await getNextNumberContado();
                ventaData.numero = numero;
                await Venta.create(ventaData);
                console.log(`Venta a ${venta.cliente} Cargada Correctamente`);
            };

            await VentaAtlasModel.updateMany({pasado: false}, {pasado: true});

            
        }
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    syncVentas
}