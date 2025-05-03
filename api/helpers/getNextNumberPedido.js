const Pedido = require('../models/Pedido');

const getNextNumberPedido = async() => {
    const numeroActualizado = await Pedido.findOneAndUpdate(
        {},
        {$inc: {numero: 1}},
        {new: true, upsert: true}
    );  
    console.log(numeroActualizado);

    return numeroActualizado.numero;
};


module.exports = getNextNumberPedido;