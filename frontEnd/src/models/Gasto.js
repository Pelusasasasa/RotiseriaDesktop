const mongoose = require('mongoose');

const Gasto = new mongoose.Schema({
    fecha: {
        type: Date,
        default: Date.now,
    },
    descripcion: {
        type: String,
        require: [true, 'La Descripcion es obligatoria'],
        set: value => value.toUpperCase()
    },
    importe: {
        type: Number,
        require: [true, 'El importe es obligatorio']
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoriaGasto',
        require: [true, 'La categoria de Gasto es Obligatoria']
    }
});

module.exports = mongoose.model('Gasto', Gasto);