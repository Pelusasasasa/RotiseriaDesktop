const { Schema, model } = require("mongoose");

const Cliente = new Schema({
    _id: Number,
    nombre: {
        type: String,
        required: true,
        trim: true,
        set: (value) => value.toUpperCase()
    },
    telefono: {
        type: String,
        trim: true,
    },
    direccion: {
        type: String,
        trim: true,
    },
    localidad: {
        type: String,
        trim: true,
    },
    saldo: {
        type: Number,
        default: 0,
    },
    condicionFacturacion: {
        type: Number,
        default: 1,
    },
    cuit: {
        type: String,
        trim: true,
    },
    condicionIva: {
        type: String,
        trim: true,
        default: 'Consumidor Final'
    },
    observaciones: {
        type: String,
        trim: true,
    }
});

module.exports = model('Cliente', Cliente);