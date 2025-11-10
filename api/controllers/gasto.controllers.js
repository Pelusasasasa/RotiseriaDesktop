
const Gasto = require("../models/Gasto");
const validarId = require("../helpers/validarId");

const gastoCTRL = {};

gastoCTRL.deleteOne = async (req, res) => {
    const { id } = req.params;

    if (!validarId(id)) {
        return res.status(400).json({
            ok: false,
            message: 'El ID del gasto no es valido'
        });
    }

    try {
        const gastoEliminado = await Gasto.findByIdAndDelete(id);
        if (!gastoEliminado) return res.status(404).json({
            ok: false,
            message: 'No existe un gasto con ese ID'
        });

        res.status(200).json({
            ok: true,
            gastoEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error al eliminar el gasto, hable con el administrador'
        });
    }
};

gastoCTRL.getGastos = async (req, res) => {
    try {
        const gastos = await Gasto.find();

        if (!gastos) return res.status(404).json({
            ok: false,
            message: 'No existen gastos'
        });

        res.status(200).json({
            ok: true,
            gastos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener los gastos, hable con el administrador'
        });
    }

};

gastoCTRL.getGastosForDate = async (req, res) => {
    const { desde, hasta } = req.params;

    try {
        const gastos = await Gasto.find({
            $and: [
                { fecha: { $gte: new Date(`${desde}T00:00:00.000Z`) } },
                { fecha: { $lte: new Date(`${hasta}T23:59:59.999Z`) } }
            ]
        }).populate('categoria', 'nombre');

        if (!gastos) return res.status(404).json({
            ok: false,
            message: 'No existen gastos para las fechas indicadas'
        });

        res.status(200).json({
            ok: true,
            gastos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener los gastos por fecha, hable con el administrador'
        });
    }


};

gastoCTRL.patchOne = async (req, res) => {
    const { id } = req.params;


    if (!validarId(id)) {
        return res.status(400).json({
            ok: false,
            message: 'El ID del gasto no es valido'
        });
    }

    try {
        const gastoModificado = await Gasto.findByIdAndUpdate(id, req.body, { new: true }).populate('categoria', 'nombre');;

        if (!gastoModificado) return res.status(404).json({
            ok: false,
            message: 'No existe un gasto con ese ID'
        });

        res.status(200).json({
            ok: true,
            gastoModificado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error al actualizar el gasto, hable con el administrador'
        });
    }
}

gastoCTRL.postOne = async (req, res) => {

    try {
        const now = new Date();
        req.body.fecha = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
        const gasto = new Gasto(req.body);
        await gasto.save();

        res.status(201).json({
            ok: true,
            gasto
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error al crear el gasto, hable con el administrador'
        });
    }
};

module.exports = gastoCTRL;