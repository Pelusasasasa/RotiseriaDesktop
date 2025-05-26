const CategoriaGasto = require("../models/CategoriaGasto");

const categoriaCTRL = {};


categoriaCTRL.getCategorias = async (req, res) => {
    try {
        const categorias = await CategoriaGasto.find().sort({ nombre: 1 });

        if(!categorias) return res.status(404).json({
            ok: false,
            msg: 'No se encontraron categorías'
        });

        res.status(200).json({
            ok: true,
            categorias
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            ok: false,
            msg: 'Error al obtener las categorías' 
        });
    }
};

categoriaCTRL.postCategoria = async (req, res) => {
    try {
        const categoria = new CategoriaGasto(req.body);
        await categoria.save();

        res.status(201).json({
            ok: true,
            categoria
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            ok: false,
            msg: 'Error al crear la categoría, hable con el administrador' 
        });
    }
}

module.exports = categoriaCTRL;