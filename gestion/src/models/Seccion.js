const mongoose = require('mongoose');

const Seccion = new mongoose.Schema({
    codigo:{
        type:Number,
        required:true
    },
    nombre:{
        type:String,
        required:true
    }
});


module.exports = mongoose.model('Seccion',Seccion);