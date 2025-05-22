const pedidoCTRL = {};

const Pedido = require('../models/Pedido');

pedidoCTRL.getOne = async(req, res) => {

    try {
        const pedido = await Pedido.findOne();

        if(!pedido) return res.status(404).json({
            ok: false,
            msg: 'No se encontro el pedido'
        });

        res.status(200).json({
            ok: true,
            pedido
        });

    } catch (error) {
        console.log(error);   
        res.status(500).json({
            ok: false,
            msg: 'No se pudo obtener el pedido, hable con el administrador',
        })
    }
};

pedidoCTRL.patchPedido = async(req, res) => {
    const { id } = req.params;
    try {
        const pedidoActualizado = await Pedido.findByIdAndDelete(id, req.body, { new: true });
        if(!pedidoActualizado) return res.status(404).json({
            ok: false,
            msg: 'No se encontro el pedido'
        });

        res.status(200).json({
            ok: true,
            pedidoActualizado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo actualizar el pedido, hable con el administrador'
        })
    }
};

module.exports = pedidoCTRL;