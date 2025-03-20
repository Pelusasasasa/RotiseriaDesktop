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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoriaGasto',
        required: [true, 'La categoria de Gasto es Obligatoria']
    }
});


module.exports = mongoose.model('Gasto', Gasto);