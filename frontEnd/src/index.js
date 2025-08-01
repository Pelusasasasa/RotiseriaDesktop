const { dialog, app, BrowserWindow, Menu, ipcRenderer, autoUpdater } = require('electron');
const { ipcMain } = require('electron/main');
const path = require('path');

//base de datos
require('./database');
require('dotenv').config()

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
            abrirVentana("seccion/seccion.html", 600, 900)
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
};

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