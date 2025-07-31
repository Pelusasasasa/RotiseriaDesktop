const {mongoose} = require('mongoose');

const MONGO_URI_ATLAS =  process.env.MONGO_URI_ATLAS;

const connectAtlas = () => {
    try {
        let conexion =  mongoose.createConnection(MONGO_URI_ATLAS);
        return conexion
    } catch (error) {
        console.error(error);
        return error;
    }
};

module.exports = connectAtlas;