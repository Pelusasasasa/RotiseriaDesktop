const axios = require('axios');
const getNextNumberPedido = require('./getNextNumberPedido');
const Venta = require('../models/Venta');
const getNextNumberContado = require('./getNextNumberContado');
const { imprimirVenta } = require('./generarImagenDesdeHTML');

const procesarPedidosDeApp = async () => {
  const fechaInicio = new Date();
  const fechaFin = new Date();

  fechaInicio.setHours(0, 0, 0, 0);
  fechaFin.setHours(23, 59, 59, 999);

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
        fechaDesde: fechaInicio.toISOString(),
        fechaHasta: fechaFin.toISOString(),
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

        cliente: posibleVenta?.cliente?.nombreUsuario || 'Consumidor Final',
        direccion: posibleVenta?.direccion?.calle + ' ' + posibleVenta?.direccion.numero || '',
        telefono: posibleVenta?.telefono || '',
        num_doc: posibleVenta?.num_doc || '',

        numero: await getNextNumberContado(),

        listaProductos: [...productos, ...productosPromociones],
        descuento: posibleVenta.descuento,
        tipo_comp: posibleVenta.tipo_comp,
        caja: posibleVenta.caja,

        dispositivo: 'WEB',
        observaciones: posibleVenta.observaciones,

        cod_comp: posibleVenta.cod_comp,
        cod_doc: posibleVenta.cod_doc,

        envio: posibleVenta.tipoEntrega !== 'RETIRO_EN_COMERCIO',
        tipo_venta: 'CD',

        precio: posibleVenta.precioTotal + posibleVenta.tarifaServicio,
        precioEnvio: posibleVenta.envio,
        idInterno: posibleVenta.idInterno,
      };

      const ventaNueva = await Venta.create(venta);
      await ventaNueva.save();

      //await imprimirVenta(ventaNueva);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  procesarPedidosDeApp,
};
