const { Schema, model } = require('mongoose');

const moment = require('moment-timezone');

const Mesa = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    cliente: {
        type: String,
        default: "Consumidor Final",
        set: value => value.toUpperCase().trim()
    },
    idCliente: {
        type: String,
        default: "0"
    },
    precio: {
        type: Number,
        default: 0
    },
    dispositivo: {
        type: String,
        default: '',
        enum: ['MOVIL', 'DESKTOP', '', 'WEB'],
        set: value => value.toUpperCase().trim()
    },
    observaciones: {
        type: String,
        default: '',
        set: value => value.toUpperCase().trim()
    },
    estado: {
        type: String,
        enum: ['abierto', 'cerrado'],
        trim: true,
        default: 'cerrado'
    },
    abierto_en: {
        type: Date,
        default: () => moment.tz('America/Argentina/Buenos_Aires').toDate()
    },
    productos: {
        type: [],
        default: []
    }
});


module.exports = model('Mesa', Mesa);