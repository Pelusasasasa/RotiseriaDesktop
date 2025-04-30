const {  mongoose } = require("mongoose");
require("dotenv").config();

const connectDB = async() => {

    try {
        mongoose.connect(process.env.MONGO_DB_URI, )    
            .then(db => console.log("Se conecto a la base de datos de Rotiseria"))
            .catch(err => console.log(err));
    } catch (error) {
        console.log(error);
    }

};

module.exports = connectDB;