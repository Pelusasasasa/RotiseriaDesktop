const Pedido = require('../models/Pedido');

const getNextNumberPedido = async(tipo_comp)=> {
    let inc = tipo_comp === 'Nota Credito C' ? 0 : 1;

    const numeroActualizado = await Pedido.findOneAndUpdate(
        {},
        {$inc: {numero: inc}},
        {new: true, upsert: true}
    );  
    console.log(numeroActualizado);

    return numeroActualizado.numero;
};


module.exports = getNextNumberPedido;