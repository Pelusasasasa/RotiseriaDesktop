const SyncPendiente = require("../models/SyncPendiente");
const Venta = require("../models/Venta");
const VentaAtlasModel = require("../models/VentaAtlas.model");
const getNextNumberContado = require("./getNextNumberContado");
const getNextNumberPedido = require("./getNextNumberPedido");
const imprimirTicketComanda = require("./imprimirTicketComanda");

const syncVentas = async() => {
    try {
        const ventasPendientes = await VentaAtlasModel.find({pasado: false});

        if(ventasPendientes.length > 0){
            for(let venta of ventasPendientes){
                const ventaData = venta.toObject();

                const tieneSyncPendiente = await SyncPendiente.findOne({
                    peticion: 'PATCH',
                    tipo: 'venta',
                    data: ventaData._id
                });

                if(!tieneSyncPendiente){
                    //Eliminar _id para que mongodb genere uno nuevo
                    delete ventaData._id;
                    const numero = await getNextNumberContado();
                    const nPedido = await getNextNumberPedido(ventaData.tipo_comp);
                    ventaData.numero = numero;
                    ventaData.nPedido = nPedido;
                    await Venta.create(ventaData);

                    imprimirTicketComanda(ventaData)
                    console.log(`Venta a ${venta.cliente} Cargada Correctamente`);
                }
            };

            try {
                await VentaAtlasModel.updateMany({pasado: false}, {pasado: true});
                console.log(`Ventas marcadas como pasadas`);
            } catch (error) {
                for(let venta of ventasPendientes){
                    await new SyncPendiente({
                        tipo: 'venta',
                        data: venta._id,
                        peticion: 'PATCH'
                    });
                };
            };
        };
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    syncVentas
};