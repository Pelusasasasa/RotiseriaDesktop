const {Schema, model} = require('mongoose');


const Variables = new Schema({
    contrasenaGasto: {
        type: String,
        default: '',
        trim: true
    }
});


module.exports = model('Variables', Variables);