const moment = require('moment-timezone');
const {Schema, model} = require('mongoose');

const Venta = new Schema({
    fecha:{
        type:Date,
        default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
    },
    nPedido:{
        type:Number,
        default:1
    },
    cliente:{
        type:String,
        default:"Consumidor Final",
        set: value => value.toUpperCase().trim()
    },
    idCliente:{
        type:String,
        default: "0"
    },
    numero:{
        type:Number,
        required:true
    },
    listaProductos:{
        type:[],
        required:true
    },
    precio:{
        type:Number,
        required:true
    },
    descuento:{
        type:Number,
        default: 0
    },
    tipo_venta:{
        type: String,
        default: "CD"  
    },
    tipo_comp:{
        type:String,
        default:""
    },
    caja:{
        type:String,
        default:""
    },
    F:{
        type:Boolean,
        default: false
    },
    afip:{
        type:Object,
        default:{}
    },
    dispositivo: {
        type: String,
        default: '',
        enum: ['MOVIL', 'DESKTOP', '', 'WEB'],
        set: value => value.toUpperCase().trim()
    },


    //Persona
    direccion: {
        type: String,
        default: '',
        set: value => value.toUpperCase().trim()
    },
    telefono: {
        type: String,
        default: ''
    },

    //Para la afip
    num_doc:{
        type:String,
        default:""
    },
    cod_comp:{
        type:Number,
        default:0
    },
    cod_doc:{
        type:Number,
        default:0
    },
    condicionIva:{
        type:String,
        default:"Consumidor Final"
    },
    iva21:{
        type:Number,
        default:0
    },
    iva105:{
        type:Number,
        default:0
    },
    gravado21:{
        type:Number,
        default:0
    },
    gravado105:{
        type:Number,
        default:0
    },
    cantIva:{
        type:Number,
        default:0
    },
    notaCredito: {
        type: Boolean,
        default: false
    },

    envio: {
        type: Boolean,
        default: false
    },

    tipo_pago: {
        type: String,
        default: 'EFECTIVO',
        set: value => value.toUpperCase().trim()
    },
    vuelto: {
        type: Number,
        default: 0
    }
});

module.exports = model('Venta',Venta);