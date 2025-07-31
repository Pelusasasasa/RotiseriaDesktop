const Variable = require("../models/Variable");

const variableCTRL = {};

variableCTRL.getAll = async(req, res) => {
    try {
        const variable = await Variable.findOne({}).sort({_id: 1});
        if (!variable) return res.status(404).json({
            ok: false,
            msg: 'No se encontró la contraseña de gasto'
        });
        
        res.status(200).json({
            ok: true,
            variable
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la contraseña de gasto, hable con el administrador',
        });
    }
};

variableCTRL.postOne = async(req, res) => {
    try {
        const variable = new Variable(req.body);
        await variable.save();

        res.status(201).json({
            ok: true,
            variable
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la contraseña de gasto, hable con el administrador',
        });
    }
};

module.exports = variableCTRL;