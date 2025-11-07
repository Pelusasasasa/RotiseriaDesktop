const { Schema, model } = require('mongoose');

const Producto = new Schema({
    _id: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
        set: value => value.toUpperCase()
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
    ganancia: {
        type: Number,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    sinStock: {
        type: Boolean,
        default: false
    },
    imgCloudinaryPath: {
        type: String,
        default: ''
    },
    seccion: {
        type: Schema.Types.ObjectId,
        ref: 'Seccion',
        default: ''
    },
    observaciones: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true,
});

module.exports = model('Producto', Producto);