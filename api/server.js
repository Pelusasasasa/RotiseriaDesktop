const express = require('express');
const cors = require('cors');
const path = require('node:path');

const connectDB = require('./config/dataBase');
const { syncVentas } = require('./helpers/syncVentasAtlas');
const { procesarPendientes } = require('./helpers/syncPendientes');
const backUpMongoLocal = require('./backUpMongoLocal');

require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/rotiseria/test', (req, res) => {
  console.log('Test exitoso');
  res.json({ ok: true, msg: 'Test exitoso' });
});

app.use('/rotiseria/img', express.static(path.join(__dirname, 'imgProductos')));

app.use('/rotiseria/carta', require('./routes/carta.routes'));
app.use('/rotiseria/categoriaGasto', require('./routes/categoriaGasto.routes'));
app.use('/rotiseria/cliente', require('./routes/cliente.routes'));
app.use('/rotiseria/gasto', require('./routes/gasto.routes'));
app.use('/rotiseria/mesa', require('./routes/mesa.routes'));
app.use('/rotiseria/numero', require('./routes/numero.routes'));
app.use('/rotiseria/pedido', require('./routes/pedido.routes'));
app.use('/rotiseria/producto', require('./routes/producto.routes'));
app.use('/rotiseria/seccion', require('./routes/seccion.routes'));
app.use('/rotiseria/variable', require('./routes/variable.routes'));
app.use('/rotiseria/venta', require('./routes/venta.routes'));

app.use('/rotiseriaWeb/venta', require('./routes/ventaAtlas.routes'));

app.use((req, res, next) => {
  res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    ok: false,
    msg: 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

setInterval(syncVentas, 1 * 1000);
setInterval(procesarPendientes, 60 * 1000);

setInterval(
  () => {
    console.log('Backup de la base de datos en proceso...');
    backUpMongoLocal();
  },
  60 * 60 * 1000
);
