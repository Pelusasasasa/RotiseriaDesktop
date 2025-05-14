const express = require('express');
const cors = require('cors');
const path = require('node:path');

const connectDB = require('./config/dataBase');
require('dotenv').config();

const app = express();


connectDB()

app.use('/img', express.static(path.join(__dirname, 'imgProductos')));

app.use(cors());
app.use(express.json());

app.use('/rotiseria/producto', require('./routes/producto.routes'));
app.use('/rotiseria/seccion', require('./routes/seccion.routes'));
app.use('/rotiseria/venta', require('./routes/venta.routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})