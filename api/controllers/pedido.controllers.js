const pedidoCTRL = {};

const Pedido = require('../models/Pedido');

const getOne = async(req, res) => {

    try {
        const pedido = await Pedido.findOne({});
        console.log(pedido);
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

const patchPedido = async(req, res) => {
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

const postOne = async(req, res) => {
    try {
        const pedidoYaCargado = await Pedido.findOne({});

        if(pedidoYaCargado) return res.status(200).json({
            ok: true,
            pedidoYaCargado
        });

        const pedido = new Pedido(req.body);
        await pedido.save();

        res.status(201).json({
            ok: true,
            pedido
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg:'No se pudo cargar el pedido'
        })
    }
}

module.exports = {
    getOne,
    patchPedido,
    postOne,    
};