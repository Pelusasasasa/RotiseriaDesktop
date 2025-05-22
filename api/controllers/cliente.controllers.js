const clienteCTRL = {};
const Cliente = require('../models/Cliente');

clienteCTRL.deleteOne = async(req, res) => {
    const { id } = req.params;
    try {
        const clienteDelete = await Cliente.findByIdAndDelete(id);
        if(!clienteDelete) return res.status(404).json({
            ok: false,
            msg: 'No se encontró el cliente'
        });

        res.status(200).json({
            ok: true,
            clienteDelete
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo eliminar el cliente, hable con el administrador'
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
};

clienteCTRL.getForFilter = async(req, res) => {
    const { text } = req.params;

    try {
        const re = new RegExp(`^${text}`);
        const clientes = await Cliente.find({ nombre: { $regex: re, $options: "i" } }).sort({ nombre: 1 });
        
        if(!clientes) return res.status(404).json({
            ok: false,
            msg: 'No se encontraron clientes'
        });

        res.status(200).json({
            ok: true,
            clientes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo obtener los Clientes, hable con el administrador'
        })
    }
};

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

clienteCTRL.updateCliente = async(req, res) => {
    const { id } = req.params;
    try {
        const clienteUpdate = await Cliente.findByIdAndUpdate(id, req.body, { new: true });
        if(!clienteUpdate) return res.status(404).json({
            ok: false,
            msg: 'No se encontró el cliente'
        });

        res.status(200).json({
            ok: true,
            clienteUpdate
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo actualizar el cliente, hable con el administrador'
        })
    }
};

clienteCTRL.getForTelefono = async(req, res) => {
    const { telefono } = req.params;

    try {
        const cliente = await Cliente.findOne({ telefono });

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
        });
    };
};

module.exports = clienteCTRL;