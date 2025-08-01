const { Schema } = require("mongoose");
const connectAtlas = require("../atlas/dbAtlas");

const SeccionSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    codigo: {
        type: Number,
        required: true,
        unique: true
    }
});

const atlasConnection = connectAtlas();
module.exports = atlasConnection.model('Seccion', SeccionSchema);