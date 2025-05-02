const ventaCTRL = {};


const getNextNumberContado = require('../helpers/getNextNumberContado');
const Venta = require('../models/Venta');

ventaCTRL.postOne = async(req, res) => {
    try {
        const numero = await getNextNumberContado();
        const newVenta = new Venta({
            ...req.body,
            numero
        });

        await newVenta.save();

        res.status(201).json({
            ok: true,
            venta: newVenta
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo cargar la venta, hable con el administrador',
            error
        })
    }
};

module.exports = ventaCTRL;