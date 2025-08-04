const CartaEmpanada = require("../models/CartaEmpanada");
const CartaEmpanadaAtlasModel = require("../models/CartaEmpanadaAtlas.model");
const SyncPendiente = require("../models/SyncPendiente");

const cartaCTRL = {};

cartaCTRL.getOne = async(req, res) => {
    try {
        const carta = await CartaEmpanada.findOne();

        if(!carta) return res.status(404).json({
            ok: false,
            msg: 'No se encontró la carta',
        });

        res.status(200).json({
            ok: true,
            carta
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener la carta, hable con el administrador',
        })
    }
};

cartaCTRL.patchOne = async(req, res) => {
    const { id } = req.params;

    try {
        const cartaActualizada = await CartaEmpanada.findByIdAndUpdate(id, req.body, { new: true });

        if(!cartaActualizada) return res.status(404).json({
            ok: false,
            msg: 'No se encontró la carta',
        });
        
        //Ejecutamos scuando queremos modificar carta empanada en la base datos mongobd atlas
        try {
            const cartaAtlas = await CartaEmpanadaAtlasModel.findOne();
            delete req.body._id;

            const cartaActualizadaAtlas = await CartaEmpanadaAtlasModel.findByIdAndUpdate(cartaAtlas._id, req.body, { new: true});

            if(!cartaActualizadaAtlas){
                await new SyncPendiente({
                    tipo: 'carta',
                    data: req.body,
                    peticion: 'PATCH'
                }).save();
            }else{
                console.log(`Carta Empanada Actualizada en MongoDb Atlas`);
            };
        } catch (error) {
            console.log(error);
            await new SyncPendiente({
                tipo: 'carta',
                data: req.body,
                peticion: 'PATCH'
            }).save();
        }

        res.status(200).json({
            ok: true,
            cartaActualizada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo actualizar la carta, hable con el administrador',
        })
    }
};

module.exports = cartaCTRL;