const mongoose = require('mongoose');

const CartaEmpanada = new mongoose.Schema({
    docena:{
        type:Number,
        required:true
    },
    mediaDocena:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('CartaEmpanada',CartaEmpanada)