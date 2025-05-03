const {Schema, model} = require('mongoose');

const Pedido = new Schema({
    fecha:{
        type:Date,
        default: Date.now
    },
    numero:{
        type:Number,
        default:0
    }
});

module.exports = model('Pedido',Pedido);