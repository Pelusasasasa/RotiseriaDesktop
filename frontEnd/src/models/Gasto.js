const mongoose = require('mongoose');

const Gasto = new mongoose.Schema({
    fecha: {
        type: Date,
        default: Date.now,
    },
    descripcion: {
        type: String,
        required: [true, 'La Descripcion es obligatoria'],
        set: value => value.toUpperCase()
    },
    importe: {
        type: Number,
        required: [true, 'El importe es obligatorio']
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoriaGasto',
        required: [true, 'La categoria de Gasto es Obligatoria']
    }
});

module.exports = mongoose.model('Gasto', Gasto);