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
        }
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
        }
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

//Revisar
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