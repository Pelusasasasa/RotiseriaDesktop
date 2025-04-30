const {  mongoose } = require("mongoose");
const runSeeders = require("../seed");
require("dotenv").config();

const connectDB = async() => {

    try {
        await mongoose.connect(process.env.MONGO_DB_URI, );
            console.log("✅ Se conecto a la base de datos de Rotiseria")
            await runSeeders();

    } catch (error) {
        console.log('❌ Error conectado MongoDb: ', error);
    }

};

module.exports = connectDB;