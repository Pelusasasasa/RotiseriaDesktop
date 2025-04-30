const productoCTRL = {};

const Producto = require('../models/Producto');

productoCTRL.getAll = async(req, res) => {
    try {
        const productos = await Producto.find();

        res.status(200).json({
            ok: true,
            productos
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudieron obtener los datos de productos, hable con el administrador'
        })
    }
},

module.exports = productoCTRL;