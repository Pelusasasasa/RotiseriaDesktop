const {Schema, model} = require('mongoose');

const Producto = new Schema({
    _id:{
        type: String,
        required:true
    },
    descripcion:{
        type: String,
        required:true
    },
    provedor: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        required: true,
    },
    costo: {
        type: Number,
        required: true,
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
    
    seccion:{
        type: Schema.Types.ObjectId,
        ref: 'Seccion',
        default: ''
    }
}, {
    timestamps: true,
});

module.exports = model('Producto',Producto);