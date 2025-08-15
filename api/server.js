const express = require('express');
const cors = require('cors');
const path = require('node:path');

const connectDB = require('./config/dataBase');
const { syncVentas } = require('./helpers/syncVentasAtlas');
const { procesarPendientes } = require('./helpers/syncPendientes');
const { generarImagenDesdeHTML } = require('./helpers/generarImagenDesdeHTML');

require('dotenv').config();

const app = express();

connectDB();

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

app.use('/rotiseriaWeb/venta', require('./routes/ventaAtlas.routes'));

app.use((req, res, next) => {
    res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
    })
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const venta = {
        "_id": "689f8cdfec89c818fb8bdbf3",
        "fecha": "2025-08-15T19:39:10.920Z",
        "nPedido": 1,
        "cliente": "CONSUMIDOR FINAL",
        "idCliente": "1",
        "numero": 1,
        "listaProductos": [
            {
                "cantidad": 1,
                "producto": {
                    "_id": "1",
                    "descripcion": "PRODUCTO NUMERO 1 LARGO",
                    "provedor": "",
                    "stock": 0,
                    "costo": 520,
                    "ganancia": 50,
                    "precio": 780,
                    "sinStock": false,
                    "imgCloudinaryPath": "",
                    "seccion": {
                        "_id": "6891361bd9668decc0e25135",
                        "codigo": 1,
                        "nombre": "TODOS"
                    },
                    "createdAt": "2025-08-15T19:38:59.667Z",
                    "updatedAt": "2025-08-15T19:38:59.667Z",
                    "__v": 0,
                    "idTabla": "1"
                }
            }
        ],
        "precio": 780,
        "descuento": 0,
        "tipo_venta": "CD",
        "tipo_comp": "Comprobante",
        "caja": "Caja 1",
        "F": true,
        "dispositivo": "DESKTOP",
        "direccion": "CHAJARI",
        "telefono": "0000000000",
        "num_doc": "000000000",
        "cod_comp": 0,
        "cod_doc": 80,
        "condicionIva": "Consumidor Final",
        "iva21": 0,
        "iva105": 0,
        "gravado21": 0,
        "gravado105": 0,
        "cantIva": 1,
        "notaCredito": false,
        "envio": false,
        "tipo_pago": "EFECTIVO",
        "vuelto": 0,
        "afip": {
            "puntoVenta": "2",
            "numero": 56
        },
        "__v": 0
};

generarImagenDesdeHTML(venta)
// imprimirVenta();

// setInterval(syncVentas, 30 * 1000)
// setInterval(procesarPendientes, 60 * 1000);
