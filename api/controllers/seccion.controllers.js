const seccionCTRL = {};

const Seccion = require('../models/Seccion');
const SyncPendiente = require('../models/SyncPendiente');
const SeccionAtlas = require('../models/SeccionAtlas');

seccionCTRL.deleteSeccion = async (req, res) => {
    const { id } = req.params;

    try {
        const seccionEliminado = await Seccion.findByIdAndDelete(id);

        if(!seccionEliminado) return res.status(404).json({
            ok: false,
            msg: 'No existe la sección'
        });
        
        //Intentamos eliminar en mongo db atlas y sino lo guardamos localmente para un posterior uso
        try {
            const seccionAtlasEliminada = await SeccionAtlas.findByIdAndDelete(id);

            if(!seccionAtlasEliminada){
                await new SyncPendiente({
                    tipo: 'seccion',
                    data: id,
                    peticion: 'DELETE'
                }).save();
            }
        } catch (error) {
            await new SyncPendiente({
                    tipo: 'seccion',
                    data: id,
                    peticion: 'DELETE'
            }).save();
        }


        res.status(200).json({
            ok: true,
            seccionEliminado
        });

    } catch (error) {
        console.error(error);        
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la sección, hable con el administrador',
        })
    }
};

seccionCTRL.getSecciones = async (req, res) => {

    try {
        const secciones = await Seccion.find().sort({ codigo: 1 });

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
        console.error(error);
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
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la sección,  hable con el administrador',
            error: error.message
        })
    }
};

seccionCTRL.getForCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const seccion = await Seccion.findOne({ codigo });

        if(!seccion) return await res.status(404).json({
            ok: false,
            msg: 'No existe la sección con ese código'
        });

        res.status(200).json({
            ok: true,
            seccion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la sección por código, hable con el administrador',
        })
    }
};

seccionCTRL.postOne = async (req, res) => {
    try {
        const seccionUsado = await Seccion.findOne({
            $or: [
                {codigo: req.body.codigo},
                {nombre: req.body.nombre}
            ]
        });

        if(seccionUsado) return res.status(500).json({
            ok: false,
            msg: 'Seccion ya utilizado'
        })

        const seccion = new Seccion(req.body);
        await seccion.save();
        
        //Ejecutamos para guardar una seccion en mongodb Atlas
        try {
            const nuevaAtlas = new SeccionAtlas(req.body);
            await nuevaAtlas.save();
        } catch (error) {
            await new SyncPendiente({
                tipo: 'seccion',
                data: req.body,
                peticion: 'POST'
            }).save();
            console.log("Guardado Localmente");
        }

        res.status(201).json({
            ok: true,
            seccion
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la sección, hable con el administrador',
        })
    }
};

module.exports = seccionCTRL;
