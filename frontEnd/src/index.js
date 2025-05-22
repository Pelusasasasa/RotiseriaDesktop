const { dialog, app, BrowserWindow, Menu, ipcRenderer, autoUpdater } = require('electron');
const { ipcMain } = require('electron/main');
const path = require('path');
const { condIva } = require('./configuracion.json')



//base de datos
require('./database');
require('dotenv').config()
const Cliente = require('./models/Cliente');
const Producto = require('./models/Producto');
const Numero = require('./models/Numero');
const Venta = require('./models/Venta');
const Gasto = require('./models/Gasto');
const Pedido = require('./models/Pedido');
const Seccion = require('./models/Seccion');
const CartaEmpanada = require('./models/CartaEmpanada');
const CategoriaGasto = require('./models/CategoriaGasto');
const Variables = require('./models/Variables');

//Fin Base de Datos

// Lo usamos para cuando alla un cambio en la aplicacion se reinicie
if (process.env.NODE_ENV === 'desarrollo') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  })
};

if (require('electron-squirrel-startup')) {
  app.quit();
}

let ventanaPrincipal;
const createWindow = () => {
  // Create the browser window.
  ventanaPrincipal = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  ventanaPrincipal.maximize();

  // and load the index.html of the app.
  ventanaPrincipal.loadFile(path.join(__dirname, 'menu.html'));

  hacerMenu();
};

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('enviar', (e, args) => {
  ventanaPrincipal.webContents.send('recibir', JSON.stringify(args));
});

ipcMain.on('sacar-cierre', e => {
  ventanaPrincipal.setClosable(false);
});

ipcMain.on('poner-cierre', e => {
  ventanaPrincipal.setClosable(true);
});

ipcMain.on('abrir-ventana', (e, args) => {
  abrirVentana(args.path, args.altura, args.ancho, args.reinicio)
  nuevaVentana.on('ready-to-show', async () => {
    nuevaVentana.webContents.send('informacion', args)
  })
});

ipcMain.on('enviar-ventana-principal', (e, args) => {
  ventanaPrincipal.webContents.send('recibir-ventana-secundaria', JSON.stringify(args));
});

ipcMain.on('imprimir', (e, args) => {
  abrirVentana("ticket/ticket.html", 800, 500);
  nuevaVentana.webContents.on('did-finish-load', function () {
    nuevaVentana.webContents.send('imprimir', JSON.stringify(args));
  });
});

ipcMain.on('imprimir-comanda', (e, args) => {
  abrirVentana("ticket/ticketComanda.html", 800, 500);
  nuevaVentana.webContents.on('did-finish-load', function () {
    nuevaVentana.webContents.send('imprimir', JSON.stringify(args));
  });
});

ipcMain.on('imprimir-ventana', (e, args) => {
  nuevaVentana.webContents.print({ silent: true }, (success, errorType) => {
    if (success) {
      ventanaPrincipal.focus();
      nuevaVentana.close();
    } else {
      ventanaPrincipal.focus();
      nuevaVentana && nuevaVentana.close();
    };
  });
});

let nuevaVentana;
const abrirVentana = (direccion, altura = 700, ancho = 1200, reinicio = false) => {
  nuevaVentana = new BrowserWindow({
    height: altura,
    width: ancho,
    modal: true,
    parent: ventanaPrincipal,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  nuevaVentana.loadFile(path.join(__dirname, `${direccion}`));
  nuevaVentana.setMenuBarVisibility(false);

  nuevaVentana.on('ready-to-show', () => {
    if (direccion !== "ticket/ticket.html" && direccion !== "ticket/ticketComanda.html") {
      nuevaVentana.show();
    }
  })

  nuevaVentana.on('close', async () => {

    if (direccion === "./clientes/agregarCliente.html" || direccion === "./productos/agregarProducto.html" || reinicio) {
      ventanaPrincipal.reload()
    }
  })
  // nuevaVentana.setMenuBarVisibility(false);
}

ipcMain.on('informacion-a-ventana', (e, args) => {
  ventanaPrincipal.webContents.send('informacion-a-ventana', JSON.stringify(args));
})

ipcMain.handle('saveDialog', async (e, args) => {
  const path = (await dialog.showSaveDialog()).filePath;
  return path
});

const hacerMenu = () => {
  //Hacemos el menu

  const template = [
    {
      label: "Datos",
      submenu: [
        {
          label: "Numeros",
          click() {
            abrirVentana("numeros/numeros.html", 750, 700)
          }
        },
        {
          label: "Seccion",
          click() {
            abrirVentana("seccion/seccion.html", 500, 900)
          }
        },
        {
          label: "Re Imprimir Factura",
          click() {
            abrirVentana('facturas/facturas.html')
          }
        }
      ]
    },
    {
      label: "Productos",
      submenu: [
        {
          label: "Modificar Codigo",
          click() {
            abrirVentana("productos/modificarCodigo.html", 500, 500)
          }
        },
        {
          label: "Agregar Producto",
          click() {
            abrirVentana("productos/agregarProducto.html", 650, 900)
          }
        },
        {
          label: "Cambio de Producto",
          click() {
            abrirVentana("productos/cambio.html", 750, 900)
          }
        },
        // {
        //   label:"Aumento Por Marcas",
        //   click(){
        //     abrirVentana('productos/marcas.html',300,500,true);
        //   }
        // },
        // {
        //   label:"Aumento Por Provedores",
        //   click(){
        //     abrirVentana('productos/aumentoPorProvedor.html',300,500,true);
        //   }
        // },
        // {
        //   label:"Lista de Precios",
        //   click(){
        //     abrirVentana('productos/listaPrecios.html',1000,1000)
        //   }
        // }
      ]
    },
    {
      label: "Clientes",
      submenu: [
        {
          label: "Agregar Cliente",
          click() {
            abrirVentana("clientes/agregarCliente.html", 1200, 900);
          }
        },
        // {
        //   label:"Listado Saldos",
        //   click(){
        //     abrirVentana("clientes/listadoSaldo.html",1000,1200)
        //   }
        // },
        // {
        //   label:"Arreglar Saldo",
        //   click(){
        //     abrirVentana("clientes/arreglarSaldo.html",500,600)
        //   }
        // }
      ]
    },
    {
      label: "Cartas",
      submenu: [
        {
          label: "Carta Empandas",
          click() {
            abrirVentana('cartas/cartasEmpanadas.html', 500, 500, false)
          }
        }
      ]
    },
    {
      label: "Configuracion",
      click() {
        abrirVentana('configuracion/configuracion.html', 700, 700, false)
      }
    },
    {
      label: "tools",
      accelerator: process.platform == "darwin" ? "Comand+D" : "Ctrl+D",
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    }

  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


//Base de datos

//Clientes
ipcMain.handle('ultimo-Id-Cliente', async (e, args) => {
  const clientesId = (await Cliente.find({}, { _id: 1 }));
  let arreglo = clientesId.map((e) => {
    return e._id;
  });
  let id = arreglo.length === 0 ? 0 : Math.max(...arreglo);
  return id;
});

ipcMain.on('agregar-cliente', async (e, args) => {
  const arg = JSON.parse(args);
  const cliente = new Cliente(JSON.parse(args));
  await cliente.save();
  console.log(`Cliente ${arg.nombre} cargado`);
});

ipcMain.handle('get-cliente', async (e, id) => {
  const cliente = (await Cliente.findOne({ _id: id }));
  return JSON.stringify(cliente);
});

ipcMain.handle('gets-clientes', async (e, args) => {
  const clientes = (await Cliente.find());
  return JSON.stringify(clientes);
});

ipcMain.handle('gets-clientes-con-filtro', async (e, args) => {
  const re = new RegExp(`^${args}`);
  const clientes = await Cliente.find({ nombre: { $regex: re, $options: "i" } }).sort({ nombre: 1 });
  return JSON.stringify(clientes);
});

ipcMain.on('eliminar-Cliente', async (e, id) => {
  await Cliente.findOneAndDelete({ _id: id });
});

ipcMain.on('put-cliente', async (e, args) => {
  await Cliente.findOneAndUpdate({ _id: args._id }, args);
});

ipcMain.handle('trearClientePorTelefono', async (e, telefono) => {
  const cliente = await Cliente.findOne({ telefono: telefono });
  return JSON.stringify(cliente)
})
//Fin Cliente

//Inicio Producto
ipcMain.on('post-producto', async (e, args) => {
  const producto = new Producto(args);
  await producto.save();
});

ipcMain.handle('get-producto', async (e, id) => {
  const producto = await Producto.findOne({ _id: id }).populate('seccion', ["codigo", "nombre"]);
  return JSON.stringify(producto)
});

ipcMain.handle('gets-productos', async (e, args) => {
  const productos = await Producto.find().populate('seccion', ["codigo", "nombre"]).sort({ _id: 1 });
  console.log(productos);
  return JSON.stringify(productos);
});

ipcMain.handle('gets-productos-for-seccion', async (e, seccion) => {
  const productos = await Producto.find({ seccion: seccion }).populate('seccion', ["codigo", "nombre"]);
  return JSON.stringify(productos);
})

//falta
ipcMain.handle('gets-productos-for-descripcion-and-seleccion', async (e, args) => {
  const [descripcion, condicion] = args;
  let productos = [];
  if (descripcion === "textoVacio") {
    productos = await Producto.find();
  } else {
    let re;
    if (descripcion[0] === "*") {
      re = new RegExp(`${descripcion.substr(1)}`);
    } else {
      re = new RegExp(`${descripcion}`);
    };
    productos = await Producto.find({ [condicion]: { $regex: re, $options: 'i' } }).populate('seccion', ["codigo", "nombre"]);
  }
  return JSON.stringify(productos);
});

ipcMain.on('put-producto', async (e, args) => {
  await Producto.findOneAndUpdate({ _id: args._id }, args);
});

ipcMain.on('delete-producto', async (e, id) => {
  await Producto.findOneAndDelete({ _id: id });
});

ipcMain.on('descontar-stock', async (e, args) => {
  for await (let producto of args) {
    delete producto.precio;
    await Producto.findOneAndUpdate({ _id: producto._id }, producto);
  }
});
//Fin Producto

//Inicio Numeros
ipcMain.on('post-numeros', async (e, args) => {
  const numero = new Numero(args);
  await numero.save();
});

ipcMain.handle('gets-numeros', async (e, args) => {
  const numeros = await Numero.findOne();
  return JSON.stringify(numeros);
});

ipcMain.on('put-numeros', async (e, args) => {
  const numeros = await Numero.findOne();
  const [key, valor] = args;
  numeros[key] = valor;
  await Numero.findOneAndUpdate({ _id: numeros._id }, numeros);
});
//Fin Numeros

//Inicio Ventas
ipcMain.handle('post-venta', async (e, args) => {
  const now = new Date();
  const venta = new Venta(JSON.parse(args));
  venta.fecha = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
  await venta.save();

  return JSON.stringify(venta);
});

//Lo que hace esta funcion es pasar la Factura como que ya se le hizo una nota de credito algunas vez
ipcMain.handle('notaCreditoTrue', async (e, id) => {
  const venta = await Venta.findOneAndUpdate({ _id: id }, {
    $set: {
      notaCredito: true
    }
  });

  return JSON.stringify(venta)
})

ipcMain.handle('get-ventas', async () => {
  const ventas = await Venta.find();
  return JSON.stringify(ventas)
});

ipcMain.handle('get-ventas-for-day', async (e, args) => {
  const inicioDia = new Date(args + "T00:00:00.000Z");
  const finDia = new Date(args + "T23:59:59.999Z");
  const ventas = await Venta.find({
    $and: [
      { fecha: { $gte: inicioDia } },
      { fecha: { $lte: finDia } },
    ]
  });
  return JSON.stringify(ventas)
});

ipcMain.handle('get-venta-for-id', async (e, id) => {
  try {
    const venta = await Venta.findOne({ _id: id });

    return JSON.stringify(venta);
  } catch (error) {
    console.log(error)
    return JSON.stringify(error);

  }
})

ipcMain.handle('get-ventas-for-month', async (e, args) => {
  const anio = (new Date()).getFullYear();
  let mes = (parseFloat(args) + 1) < 10 ? `0${parseFloat(args) + 1}` : parseFloat(args) + 1;
  let year = mes === 13 ? anio + 1 : anio;
  mes = mes === 13 ? "01" : mes;

  const inicioMes = new Date(`${anio}-${args}-01T00:00:00.000Z`);
  const finMes = new Date(`${year}-${mes}-01T00:00:00.000Z`);

  const ventas = await Venta.find({
    $and: [
      { fecha: { $gte: inicioMes } },
      { fecha: { $lt: finMes } },
    ]
  });
  return JSON.stringify(ventas);
});

ipcMain.handle('get-ventas-for-year', async (e, args) => {
  const inicioYear = new Date(`${args}-01-01T00:00:00.000Z`);
  const finYear = new Date(`${args}-12-31T23:59:59.999Z`);
  const ventas = await Venta.find({
    $and: [
      { fecha: { $gte: inicioYear } },
      { fecha: { $lt: finYear } },
    ]
  });
  return JSON.stringify(ventas);
});

ipcMain.handle('get-facturas', async (e, { desde, hasta }) => {
  const inicioDia = new Date(desde + "T00:00:00.000Z");
  const finDia = new Date(hasta + "T23:59:59.999Z");
  const ventas = await (Venta.find({
    $and: [
      { fecha: { $gte: inicioDia } },
      { fecha: { $lte: finDia } },
      { F: true }
    ]
  }));

  return JSON.stringify(ventas);
});

ipcMain.handle('delete-venta', async (e, id) => {
  try {
    const ventaDelete = await Venta.findByIdAndDelete(id);

    return JSON.stringify(ventaDelete);
  } catch (error) {
    error.msg = 'Hable con el administrador'
    return JSON.stringify(error);
  }
});
//Fin Ventas

//Inicio Pedido
ipcMain.on('cargar-numero-pedido', async (e, args) => {
  const pedido = await Pedido.findOne();
  if (!pedido) {
    const now = new Date();
    const nuevoPedido = new Pedido({ numero: 0 });
    nuevoPedido.fecha = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

    await nuevoPedido.save();
  }
});

ipcMain.handle('get-numero-pedido', async e => {
  const pedido = await Pedido.findOne();
  return JSON.stringify(pedido);
});

ipcMain.on('put-pedido', async (e, args) => {
  await Pedido.findOneAndUpdate({ _id: args._id }, args);
});
//Fin Pedido


//Inicio Seccion

ipcMain.on('post-seccion', async (e, args) => {
  const seccion = new Seccion(args);
  await seccion.save();
  // res.send(`Seccion ${args.body.nombre} cargado`);
});

ipcMain.handle('get-secciones', async e => {
  const secciones = await Seccion.find();
  return JSON.stringify(secciones);
});

ipcMain.handle('get-forCodigo-seccion', async (e, codigo) => {
  const seccion = await Seccion.findOne({ codigo: codigo });
  return (JSON.stringify(seccion));
});

ipcMain.handle('delete-seccion', async (e, args) => {
  try {
    await Seccion.findOneAndDelete({ codigo: args });
    return (true);
  } catch (error) {
    return (false)
  }
});
//Fin Seccion

//Inicio CartaEmpanada

ipcMain.on('post-CartaEmpanada', async (e, args) => {
  const carta = new CartaEmpanada(args);
  await carta.save();
});

ipcMain.on('put-CartaEmpanada', async (e, args) => {
  await CartaEmpanada.findOneAndUpdate({ _id: args._id }, args);
});


ipcMain.handle('get-cartaEmpanada', async () => {
  const precios = await CartaEmpanada.findOne();
  return JSON.stringify(precios)
});

//Fin CartaEmpanada

//Inicio Gastos
ipcMain.handle('get-gastos', async (e, args) => {
  const gastos = await Gasto.find().populate('categoria', ['nombre']);

  return JSON.stringify(gastos)
});

ipcMain.handle('get-gastos-for-date', async (e, args) => {
  const { desde, hasta } = args;
  const gastos = await Gasto.find({
    $and: [
      {
        fecha: {
          $gte: new Date(desde + "T00:00:00.000Z")
        }
      },
      { fecha: { $lte: new Date(hasta + "T23:59:59.000Z") } }
    ]
  }).populate('categoria', ['nombre']);

  return JSON.stringify(gastos)
})

ipcMain.handle('post-gasto', async (e, args) => {
  try {
    const gasto = new Gasto(args);

    await gasto.save();

    const gastoConCategoria = await Gasto.findOne({ _id: gasto._id }).populate('categoria', ['nombre']);
    return JSON.stringify(gastoConCategoria)
  } catch (error) {
    return JSON.stringify(error);
  }
});

ipcMain.handle('delete-gasto', async (e, args) => {
  const id = args;
  try {
    const deleteGasto = await Gasto.findByIdAndDelete(id);

    return JSON.stringify(deleteGasto);
  } catch (error) {
    console.log(error);
    return error;
  }
});

ipcMain.handle('put-gasto', async (e, gasto) => {
  try {
    const gastoUpdate = await Gasto.findOneAndUpdate({ _id: gasto._id }, gasto, { new: true }).populate('categoria', ['nombre']);

    return JSON.stringify(gastoUpdate);
  } catch (error) {
    return JSON.stringify(error)
  };
});

//Inicio Categoria Gasto

ipcMain.handle('get-categoriaGasto', async (e) => {

  const categorias = await CategoriaGasto.find();

  return JSON.stringify(categorias);

});

ipcMain.handle('post-categoriaGasto', async (e, args) => {
  try {
    const categoriaGasto = new CategoriaGasto(args);

    await categoriaGasto.save();

    return JSON.stringify(categoriaGasto)
  } catch (error) {
    return error
  }
});

//Inicion Variables

ipcMain.handle('get-contrasenaGasto', async (e, args) => {
  const contrasena = await Variables.findOne().sort({ _id: 1 });

  return JSON.stringify(contrasena)
})

ipcMain.handle('post-variables', async () => {
  const variable = new Variables();
  await variable.save();
  return JSON.stringify(variable);
});

ipcMain.handle('post-variables-and-contrasenaGasto', async (e, args) => {
  const variable = new Variables(args);
  await variable.save();
  return JSON.stringify(variable);
});


autoUpdater.on('update-available', () => {
  console.log("a");
  ventanaPrincipal.webContents.send('actualizacion-disponible');
});

autoUpdater.on('update-downloaded', () => {
  console.log("v");
  ventanaPrincipal.webContents.send('actualizacion-desccargada');
});

ipcMain.on('reiniciar-aplicacion', () => {
  console.log('c');
  autoUpdater.quitAndInstall();
});

// setInterval(() => {
//   autoUpdater.checkForUpdates()
//   console.log(k);
// }, 60000);