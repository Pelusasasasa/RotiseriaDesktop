const { Schema } = require("mongoose");
const connectAtlas = require("../atlas/dbAtlas");

const CartaEmpanadaSchema = new Schema({
    docena:{
        type: Number,
        required: true,
    },
    mediaDocena: {
        type: Number,
        required: true
    }
});

const atlasConnection = connectAtlas();
module.exports = atlasConnection.model('CartaEmpanada', CartaEmpanadaSchema);