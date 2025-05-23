const {Schema, model} = require('mongoose');

const CartaEmpanada = new Schema({
    docena:{
        type:Number,
        required:true
    },
    mediaDocena:{
        type:Number,
        required:true
    }
});

module.exports = model('CartaEmpanada', CartaEmpanada);