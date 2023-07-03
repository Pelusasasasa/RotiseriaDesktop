const mongoose = require('mongoose');

const Cliente = new mongoose.Schema({
    _id:Number,
    nombre:{
        type:String,
        required:true
    },
    telefono:{
        type:String,
        default:""
    },
    direccion:{
        type:String,
        default:""
    },
    localidad:{
        type:String,
        default:""
    },
    listaVentas:[],
    saldo:{
        type: Number,
        default: 0
    },
    condicionFacturacion:{
        type:Number,
        default:1
    },
    cuit:{
        type:String,
        default:""
    },
    condicionIva:{
        type:String,
        default:"Consumidor Final"
    },
    observaciones:{
        type:String,
        default:""
    }
});

module.exports = mongoose.model('Cliente',Cliente);