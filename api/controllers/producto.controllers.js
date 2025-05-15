const productoCTRL = {};

const Producto = require('../models/Producto');

productoCTRL.getAll = async(req, res) => {
    try {
        const productos = await Producto.find().populate('seccion');

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
};

productoCTRL.patchPrecio = async(req, res) => {
    const { id } = req.params;
    const datos = req.body;
    try {
        const newProducto = await Producto.findOneAndUpdate({_id: id}, datos, {new: true});

        res.status(200).json({
            ok: true,
            newProducto
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            error,
            msg: 'No se pudo modificar el precio, hable con el administraor'
        })
    }
};

module.exports = productoCTRL;