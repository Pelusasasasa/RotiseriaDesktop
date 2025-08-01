const mongoose = require('mongoose');

const Seccion = new mongoose.Schema({
    codigo:{
        type:Number,
        required:true,
        unique: true
    },
    nombre:{
        type:String,
        required:true,
        unique: true,
        trim: true,
        set: value => value.toUpperCase()
    }
});


module.exports = mongoose.model('Seccion', Seccion);