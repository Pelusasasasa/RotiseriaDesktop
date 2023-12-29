const mongoose = require('mongoose');

const Gasto = new mongoose.Schema({
    fecha: {
        type: Date,
        default: Date.now,
    },
    descripcion: {
        type:String,
        require: [true,'La Descripcion es obligatoria']
    },
    importe: {
        type:Number,
        require: [true,'El importe es obligatorio']
    }
});

module.exports = mongoose.model('Gasto',Gasto);