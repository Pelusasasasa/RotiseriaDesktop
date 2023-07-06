const mongoose = require('mongoose');

const Producto = new mongoose.Schema({
    _id:{
        type: String,
        required:true
    },
    descripcion:{
        type: String,
        required:true
    },
    provedor:{
        type:String,
        default:""
    },
    stock:{
        type: Number,
        required: true
    },
    costo:{
        type: Number,
        required: true
    },
    ganancia:{
        type: Number,
        required:true
    },
    precio:{
        type:Number,
        required:true
    },
    textBold:{
        type:Boolean,
        default: false
    },
    bufferIMG:{
        type:String,
        default:""
    },
    seccion:{
        type:String,
        default:""
    }


});

module.exports = mongoose.model('Producto',Producto);