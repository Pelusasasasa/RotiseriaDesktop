const {Schema, model} = require('mongoose');

const Gasto = new Schema({
    fecha: {
        type: Date,
        default: Date.now,
    },
    descripcion: {
        type: String,
        required: [true, 'La Descripcion es obligatoria'],
        set: value => value.toUpperCase()
    },
    cantidad: {
        type: Number,
        required: [true, 'La cantidad es obligatoria']
    },
    importe: {
        type: Number,
        required: [true, 'El importe es obligatorio']
    },
    total: {
        type: Number,
        required: true,
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'CategoriaGasto',
        required: [true, 'La categoria de Gasto es Obligatoria']
    },
    tipo: {
        type: String,
        required: [true, 'El tipo de Gasto es obligatorio'],
        enum: ['Gasto', 'Egreso']
    }
});


module.exports = model('Gasto', Gasto);