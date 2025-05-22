const seccionCTRL = {};

const Seccion = require('../models/Seccion');

seccionCTRL.deleteSeccion = async (req, res) => {
    const { id } = req.params;

    try {
        const seccionEliminado = await Seccion.findByIdAndDelete(id);

        if(!seccionEliminado) return res.status(404).json({
            ok: false,
            msg: 'No existe la sección'
        });

        res.status(200).json({
            ok: true,
            seccionEliminado
        });

    } catch (error) {
        console.log(error);        
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la sección, hable con el administrador',
        })
    }
};

seccionCTRL.getSecciones = async (req, res) => {

    try {
        const secciones = await Seccion.find();

        if(secciones.length === 0) {
            return res.status(404).json({ 
                ok: false,
                message: 'No hay secciones registradas'
             });
        }
        return res.status(200).json({
            ok: true,
            secciones
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las secciones,  hable con el administrador',
            error: error.message
        })
    }

};

seccionCTRL.getSeccion = async (req, res) => {
    const { id } = req.params;

    try {
        const seccion = await Seccion.findById(id);

        if(!seccion) {
            return res.status(404).json({ 
                ok: false,
                message: 'No existe la sección'
             });
        }
        return res.status(200).json({
            ok: true,
            seccion
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la sección,  hable con el administrador',
            error: error.message
        })
    }
};

seccionCTRL.postOne = async (req, res) => {
    try {
        const seccion = new Seccion(req.body);
        await seccion.save();

        res.status(201).json({
            ok: true,
            seccion
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la sección, hable con el administrador',
        })
    }
};

module.exports = seccionCTRL;
