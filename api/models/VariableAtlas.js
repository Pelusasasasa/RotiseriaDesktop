const { Schema } = require("mongoose");
const connectAtlas = require("../atlas/dbAtlas");

const VariableSchema = new Schema({
    contrasenaGasto: {
        type: String,
        default: '',
        trim: true
    },
    paginaWebAbierto: {
        type: Boolean,
        default: true,
    }
});

const atlasConnection = connectAtlas();
module.exports = atlasConnection.model('Variable', VariableSchema);