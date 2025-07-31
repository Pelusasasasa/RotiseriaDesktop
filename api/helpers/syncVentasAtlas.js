const Venta = require("../models/Venta");
const VentaAtlasModel = require("../models/VentaAtlas.model");
const getNextNumberContado = require("./getNextNumberContado");
const imprimirTicketComanda = require("./imprimirTicketComanda");

const syncVentas = async() => {
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

                imprimirTicketComanda(ventaData)
                console.log(`Venta a ${venta.cliente} Cargada Correctamente`);
            };

            await VentaAtlasModel.updateMany({pasado: false}, {pasado: true});

            
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    syncVentas
};