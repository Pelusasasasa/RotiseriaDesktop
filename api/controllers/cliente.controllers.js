const clienteCTRL = {};
const Cliente = require('../models/Cliente');

clienteCTRL.postOne = async(req, res) => {
    try {
        const clienteId = await Cliente.findOne().sort({ _id: -1 }).limit(1);
        req.body._id = clienteId.length === 0 ? 1 : clienteId._id + 1;

        const newCliente = new Cliente(req.body);
        await newCliente.save();

        res.status(201).json({
            ok: true,
            newCliente
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo crear el cliente, hable con el administrador'
        })
    } 
};

clienteCTRL.getClientes = async(req, res) => {
    try {
        const clientes = await Cliente.find();
        res.status(200).json({
            ok: true,
            clientes
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo obtener el cliente, hable con el administrador'
        })
    }
};

clienteCTRL.getCliente = async(req, res) => {
    const { id } = req.params;
    try {
       const cliente = await Cliente.findById(id); 

       if(!cliente) return res.status(404).json({
            ok: false,
            msg: 'No se encontró el cliente'
        });

        res.status(200).json({
            ok: true,
            cliente
       });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo obtener el cliente, hable con el administrador'
        })
    }
}

module.exports = clienteCTRL;