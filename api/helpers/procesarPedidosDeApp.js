const axios = require('axios');
const getNextNumberPedido = require('./getNextNumberPedido');
const Venta = require('../models/Venta');
const getNextNumberContado = require('./getNextNumberContado');
const { imprimirVenta } = require('./generarImagenDesdeHTML');

const formatFechaLocal = (date) => {
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const procesarPedidosDeApp = async () => {
  const now = new Date();
  const fechaInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const fechaFin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  try {
    //obtener pedidos de hoy
    const username = 'sabor-urbano';
    const password = 'su@livery2026';

    const token = btoa(`${username}:${password}`);

    const response = await axios.get('https://api-info-360.com:8201/livery/pedidosSaborUrbano/obtenerPedidos', {
      headers: {
        Authorization: `Basic ${token}`,
      },
      params: {
        fechaDesde: formatFechaLocal(fechaInicio),
        fechaHasta: formatFechaLocal(fechaFin),
      },
    });

    const posibleVentas = response.data.filter((pedido) => pedido.estado.nombre === 'EN_PREPARACION');

    for (let posibleVenta of posibleVentas) {

      const ventaYaPasada = await Venta.findOne({ idInterno: posibleVenta.idInterno });

      if (ventaYaPasada) {
        continue;
      }

      const productos = posibleVenta.itemsProductos.map((item) => {
        return {
          producto: {
            descripcion: item.nombreProducto,
            seccion: '',
            precio: item.precioUnitario,
          },
          cantidad: item.cantidad,
        };
      });

      const productosPromociones = posibleVenta?.itemsPromociones?.map((item) => {
        return {
          producto: {
            descripcion: item.nombrePromocion,
            seccion: '',
            precio: item.precioUnitario,
          },
          cantidad: item.cantidad,
        };
      }) || [];

      const venta = {
        fecha: new Date(),
        nPedido: await getNextNumberPedido(),

        cliente: posibleVenta?.nombreUsuario || 'Consumidor Final',
        direccion: posibleVenta?.direccion?.calle + ' ' + posibleVenta?.direccion.numero || '',
        telefono: posibleVenta?.telefono || '',
        num_doc: posibleVenta?.num_doc || '',

        numero: await getNextNumberContado(),

        listaProductos: [...productos, ...productosPromociones],
        descuento: posibleVenta.descuento,
        tipo_comp: posibleVenta.tipo_comp,
        caja: posibleVenta.caja,
        envio: posibleVenta.tipoEntrega !== 'RETIRO_EN_COMERCIO' ? true : false,

        dispositivo: 'APP',
        observaciones: posibleVenta.observaciones,

        cod_comp: posibleVenta.cod_comp,
        cod_doc: posibleVenta.cod_doc,

        envio: posibleVenta.tipoEntrega !== 'RETIRO_EN_COMERCIO',
        tipo_venta: 'CD',

        precio: posibleVenta.precioTotal,
        precioEnvio: posibleVenta.tipoEntrega !== 'RETIRO_EN_COMERCIO' ? posibleVenta.envio : 0,
        idInterno: posibleVenta.idInterno,
      };

      const ventaNueva = await Venta.create(venta);
      await ventaNueva.save();

      await imprimirVenta(ventaNueva, true, posibleVenta.tarifaServicio);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  procesarPedidosDeApp,
};
