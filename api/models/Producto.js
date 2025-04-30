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
    
    precio:{
        type:Number,
        required:true
    },
    seccion:{
        type:String,
        default:""
    }


});

module.exports = mongoose.model('Producto',Producto);