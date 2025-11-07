const { Schema } = require("mongoose");
const connectAtlas = require("../atlas/dbAtlas");

const ProductoAtlasSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,
        set: value => value.toUpperCase()
    },
    precio: {
        type: Number,
        required: true
    },
    sinStock: {
        type: Boolean,
        default: false
    },
    imgCloudinaryPath: {
        type: String,
        default: ''
    },
    seccion: {
        type: Schema.Types.ObjectId,
        ref: 'Seccion',
        default: ''
    },
    observaciones: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true,
});


const atlasConnection = connectAtlas();
module.exports = atlasConnection.model('Producto', ProductoAtlasSchema);