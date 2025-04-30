const {Schema, model} = require('mongoose');

const Producto = new Schema({
    _id:{
        type: String,
        required:true
    },
    descripcion:{
        type: String,
        required:true
    },
    
    precio:{
        type:Number,
        required:true
    },
    seccion:{
        type: Schema.Types.ObjectId,
        ref: 'Seccion',
    }
}, {
    timestamps: true,
});

module.exports = model('Producto',Producto);