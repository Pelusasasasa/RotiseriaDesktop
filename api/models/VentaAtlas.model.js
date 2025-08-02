const connectAtlas = require("../atlas/dbAtlas");

const { Schema } = require("mongoose");

const VentaSchema = new Schema({
    fecha: {
        type: Date,
        default: Date.now
    },
    cliente: {
        type: String,
        default: 'Consumidor Final'
    },
    idCliente: {
        type: String,
        default: '1'
    },
    telefono: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    observaciones: {
        type: String,
        default: ''
    },
    listaProductos: {
        type: [],
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    descuento: {
        type: Number,
        required: true
    },
    tipo_venta: {
        type: String,
        default: 'CD'
    },
    tipo_comp: {
        type: String,
        default: ''
    },
    dispositivo: {
        type: String,
        default: 'WEB'
    },
    envio: {
        type: Boolean,
        default: false
    },
    tipo_pago: {
        type: String,
        default: 'EFECTIVO'
    },
    pasado: {
        type: Boolean,
        default: false
    },
    vuelto: {
        type: Number,
        default: 0
    }
    
});

const atlasConnection = connectAtlas();
module.exports = atlasConnection.model('Venta', VentaSchema);