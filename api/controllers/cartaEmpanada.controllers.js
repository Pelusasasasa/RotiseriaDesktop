const CartaEmpanada = require("../models/CartaEmpanada");

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
        console.log(error);
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

        res.status(200).json({
            ok: true,
            cartaActualizada
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo actualizar la carta, hable con el administrador',
        })
    }
};

module.exports = cartaCTRL;