const Numero = require('../models/Numero');

const getNextNumberContado = async() => {

    const numeroActualizado = await Numero.findOneAndUpdate(
        {},
        {$inc: {Contado: 1}},
        {new: true, upsert: true}
    );

    return numeroActualizado.Contado;
};


module.exports = getNextNumberContado;