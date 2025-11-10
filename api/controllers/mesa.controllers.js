const validarId = require("../helpers/validarId");
const Mesa = require("../models/Mesa");

const mesaCTRL = {};

mesaCTRL.deleteOne = async (req, res) => {
    const { id } = req.params;

    if (!validarId(id)) {
        return res.status(400).json({
            ok: false,
            msg: 'El Id de la mesa no es valido'
        });
    };

    try {
        const mesaEliminada = await Mesa.findByIdAndDelete(id);
        if (!mesaEliminada) return res.status(404).json({
            ok: false,
            msg: 'No existe una mesa con ese ID'
        });

        res.status(200).json({
            ok: true,
            mesaEliminada
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la mesa, hable con el administrador'
        })
    }



};

mesaCTRL.getMesas = async (req, res) => {
    try {
        const mesas = await Mesa.find();
        if (!mesas || mesas.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No existen mesas'
            });
        };

        res.status(200).json({
            ok: true,
            mesas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las mesas, hable con el administrador'
        });
    }
};

mesaCTRL.getMesasAbiertas = async (req, res) => {
    try {
        const mesas = await Mesa.find({ estado: 'abierto' });
        if (!mesas || mesas.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No existen mesas'
            });
        };

        res.status(200).json({
            ok: true,
            mesas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las mesas, hable con el administrador'
        });
    }
};

mesaCTRL.postMesa = async (req, res) => {
    try {
        const { nombre, cantidad } = req.body;

        // Validaciones básicas
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            return res.status(400).json({
                ok: false,
                msg: 'El nombre de la mesa es requerido'
            });
        };

        const nuevaMesa = new Mesa(req.body);

        await nuevaMesa.save();

        res.status(201).json({
            ok: true,
            mesa: nuevaMesa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la mesa, hable con el administrador'
        });
    }
};

mesaCTRL.putMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cantidad } = req.body;

        // Validar que el id exista y sea válido
        if (!id || typeof id !== 'string' || !validarId(id)) {
            return res.status(400).json({
                ok: false,
                msg: 'El ID de la mesa no es válido'
            });
        }

        // Validar campos a actualizar
        const updateFields = {};
        if (nombre !== undefined) {
            if (typeof nombre !== 'string' || !nombre.trim()) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El nombre de la mesa no es válido'
                });
            }
            updateFields.nombre = nombre.trim();
        };
        if (cantidad !== undefined) {
            if (typeof cantidad !== 'number' || cantidad < 0) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La cantidad debe ser un número mayor o igual a 0'
                });
            }
            updateFields.cantidad = cantidad;
        }

        const mesaActualizada = await Mesa.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!mesaActualizada) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontró la mesa con el ID proporcionado'
            });
        }

        res.status(200).json({
            ok: true,
            mesa: mesaActualizada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la mesa, hable con el administrador'
        });
    }
};

mesaCTRL.abrirMesa = async (req, res) => {
    try {
        const { id } = req.params;

        const mesa = await Mesa.findById(id);

        if (!mesa) {

            res.status(404).json({
                ok: false,
                msg: 'Error al abrir la mesa'
            });
        };

        mesa.estado = 'abierto',
            await mesa.save();

        res.status(200).json({
            ok: true,
            mesa
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Erro al abrir la mesa, hable con el administrador'
        })
    }
}

module.exports = mesaCTRL