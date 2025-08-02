const SyncPendiente = require("../models/SyncPendiente");
const Variable = require("../models/Variable");
const VariableAtlas = require("../models/VariableAtlas");

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

variableCTRL.tooglePaginaWeb = async(req, res) => {

    try {
        const variable = await Variable.findOne({}).sort({_id: 1});

        if(!variable){
            res.status(404).json({
                ok: false,
                msg: 'No se encontró variable'
            });
        };

        const variableActualizada = await Variable.findOneAndUpdate({_id: variable._id}, req.body, {new: true});
        
        //Ejecutamos para modficar la variable que esta en mongodb atlas
        try {
            const variableAtlas = await VariableAtlas.findOne({}).sort({_id: 1});
            const variableActualizadaWeb = await VariableAtlas.findOneAndUpdate({_id: variableAtlas._id}, req.body, {new: true});
            
            if(!variableActualizadaWeb){
                await new SyncPendiente({
                    tipo: 'variable',
                    data: req.body,
                    peticion: 'PATCH'
                });
            }else{
                console.log(`Variable Pagina Web Atlas Actualizada`)
            }
        } catch (error) {
            console.log(error)
            await new SyncPendiente({
                tipo: 'variable',
                data: req.body,
                peticion: 'PATCH'
            });
        }

        res.status(200).json({
            ok: true,
            variableActualizada
        });

        
    } catch (error) {
        
    }

};

module.exports = variableCTRL;