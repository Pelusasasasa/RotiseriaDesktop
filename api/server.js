const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dataBase');
const app = express();
require('dotenv').config();

connectDB()

app.use(cors());
app.use(express.json());

app.use('/rotiseria/producto', require('./routes/producto.routes'));
app.use('/rotiseria/seccion', require('./routes/seccion.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})