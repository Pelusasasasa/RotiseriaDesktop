const { Schema, model } = require("mongoose");

const SyncPendienteSchema = new Schema({
    tipo: String,
    peticion: String,
    data: Schema.Types.Mixed,
    creado: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('SyncPendienteSchema', SyncPendienteSchema);