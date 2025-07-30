const VentaAtlas = require('../models/VentaAtlas.model');
const Venta = require('../models/Venta');
const getNextNumberContado = require('../helpers/getNextNumberContado');

const traerVentasAtlas = async(req, res) => {
    try {
        //Traer ventas Atlas
        const ventas = await VentaAtlas.find({pasado: false});

        if(ventas.length > 0){
            
            for(let venta of ventas){
                const ventaData = venta.toObject(); 
                
                // Eliminar _id para que MongoDB genere uno nuevo
                delete ventaData._id;
                const numero = await getNextNumberContado();
                ventaData.numero = numero;
                await Venta.create(ventaData);
            };

            await VentaAtlas.updateMany({ pasado: false }, { pasado: true });
        };

        res.status(200).json({
            ok: true,
            ventas
        })
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    traerVentasAtlas
};