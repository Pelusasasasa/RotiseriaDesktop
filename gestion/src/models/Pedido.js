const mongoose = require('mongoose');

const Pedido = new mongoose.Schema({
    fecha:{
        type:Date,
        default: Date.now
    },
    numero:{
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('Pedido',Pedido);