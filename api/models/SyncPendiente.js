const { Schema, model } = require("mongoose");

const SyncPendienteSchema = new Schema({
    tipo: {
        type: String,
        required: true,
        trim: true
    },
    peticion: {
        type: String,
        required: true,
        trim: true,
        set: value => value.toUpperCase()
    },
    data: Schema.Types.Mixed,
    creado: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('SyncPendienteSchema', SyncPendienteSchema);