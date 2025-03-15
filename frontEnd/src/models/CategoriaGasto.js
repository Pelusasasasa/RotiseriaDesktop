const mongoose = require('mongoose');

const CategoriaGasto = new mongoose.Schema({
    nombre:{
        type: String,
        required: [true, 'El nombre de la categoria es obligatorio'],
        unique: true,
        trim: true
    }
});

module.exports = mongoose.model('CategoriaGasto', CategoriaGasto);