const express = require('express');
const cors = require('cors');
const path = require('node:path');

const connectDB = require('./config/dataBase');
require('dotenv').config();

const app = express();

connectDB()

app.use(cors());
app.use(express.json());

app.use('/rotiseria/img', express.static(path.join(__dirname, 'imgProductos')));

app.use('/rotiseria/carta', require('./routes/carta.routes'));
app.use('/rotiseria/categoriaGasto', require('./routes/categoriaGasto.routes'));
app.use('/rotiseria/cliente', require('./routes/cliente.routes'));
app.use('/rotiseria/gasto', require('./routes/gasto.routes'));
app.use('/rotiseria/numero', require('./routes/numero.routes'));
app.use('/rotiseria/pedido', require('./routes/pedido.routes'));
app.use('/rotiseria/producto', require('./routes/producto.routes'));
app.use('/rotiseria/seccion', require('./routes/seccion.routes'));
app.use('/rotiseria/variable', require('./routes/variable.routes'));
app.use('/rotiseria/venta', require('./routes/venta.routes'));

app.use((req, res, next) => {
    res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
  });
  

app.use((err, req, res, next) => {
    
    res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})