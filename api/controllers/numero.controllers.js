const Numero = require("../models/Numero");

const numeroCTRL = {};

numeroCTRL.getOne = async(req, res) => {
    try {
        const numero = await Numero.findOne();

        if(!numero){
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron numeros',
            })
        };

        res.status(200).json({
            ok: true,
            numero
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los numeros',
        })
    }
};

numeroCTRL.postOne = async(req, res) => {

    try {
        const numero = new Numero(req.body);

        await numero.save();

        res.status(201).json({
            ok: true,
            numero
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear los numeros',
        })
    }

};

numeroCTRL.patchOne = async(req, res) => {
    try {
        const numero = await Numero.findOne();
        const [key, valor] = req.body;
        numeros[key] = valor;
        
        const numeroActualizado = await Numero.findOneAndUpdate(numero._id, numeros, { new: true });
        if(!numeroActualizado) return res.status(404).json({
            ok: false,
            msg: 'No se encontraron numeros',
        });

        res.status(200).json({
            ok: true,
            numero: numeroActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar los numeros'
        })
    }
};

module.exports = numeroCTRL;