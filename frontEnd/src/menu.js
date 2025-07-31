require('dotenv').config(); 
const { ipcRenderer } = require("electron");
const axios = require('axios');
const sweet = require('sweetalert2');

const URL = process.env.ROTISERIA_URL;

const archivo = require('./configuracion.json');

ipcRenderer.send('poner-cierre');

const { abrirVentana, ponerNumero, cargarVendedor, verificarUsuarios } = require('./helpers');
const { default: Swal } = require("sweetalert2");

const ventas = document.querySelector('.ventas');
const clientes = document.querySelector('.clientes');
const caja = document.querySelector('.caja');
const productos = document.querySelector('.productos');
const gastos = document.querySelector('.gastos');
const consulta = document.querySelector('.consulta');
const recibo = document.querySelector('.recibo');
const notaCredito = document.querySelector('.notaCredito');

let verVendedores;
let contrasenaGasto;

window.addEventListener('load', async e => {
    let pedido;
    try {
        const { data } = await axios.get(`${URL}pedido`);
        if(!data.ok ) return await sweet.fire('Error al traer pedido numeros', data.msg, 'error');
        pedido = data.pedido;
    } catch (error) {
        console.log(error);
        const { data } = await axios.post(`${URL}pedido`, {numero: 0, fecha: new Date().toISOString()});
        pedido = data.pedido;
    };

    const diaPedido = pedido.fecha.slice(8, 10)
    const fecha = new Date();
    const hoy = (new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString());
    const diaHoy = hoy.slice(8, 10);
    
    if (!(diaPedido === diaHoy)) {
        pedido.numero = 0;
        pedido.fecha = hoy;
        try {
            const { data } = await axios.patch(`${URL}pedido/${pedido._id}`, pedido);
            if (!data.ok) return await sweet.fire('Error al actualizar pedido', data.msg, 'error');
        } catch (error) {
            console.log(error.response.data.msg);
            return await sweet.fire('Error al actualizar pedido', error.response.data.msg, 'error');
        }
    }

    try {
        const { data } = await axios.get(`${URL}variable`);
        if(!data.ok) return await sweet.fire('Error al traer variables', data.msg, 'error');
        contrasenaGasto = data.variable.contrasenaGasto;
    } catch (error) {
        console.log(error.response.data.msg);
        return await sweet.fire('Error al traer variables', error.response.data.msg, 'error');
    }

    if (!contrasenaGasto) {
        const { isConfirmed, value } = await Swal.fire({
            title: 'Poner Contraseña de Gasto por unica vez',
            confirmButtonText: 'Aceptar',
            input: 'text',
            showCancelButton: true,
        });

        if (isConfirmed) {
            try {
                const {data} = await axios.post(`${URL}variable`, { contrasenaGasto: value });
                if (!data.ok) return await sweet.fire('Error al guardar la contraseña', data.msg, 'error');
                contrasenaGasto = data.variable.contrasenaGasto;
            } catch (error) {
                console.log(error.response.data.msg);
                return await sweet.fire('Error al guardar la contraseña', error.response.data.msg, 'error');
            }
        };
    };
});

//Al tocar el atajo de teclado, abrimos ventanas
document.addEventListener('keyup', async e => {
    if (e.keyCode === 112) {
        ventas.click()
    } else if (e.keyCode === 113) {
        const opciones = {
            path: "clientes/agregarCliente.html",
            ancho: 1200,
            altura: 500
        }
        ipcRenderer.send('abrir-ventana', opciones);
    } else if (e.keyCode === 114) {
        const opciones = {
            path: "productos/agregarProducto.html",
            ancho: 1200,
            altura: 550
        };
        ipcRenderer.send('abrir-ventana', opciones);
    } else if (e.keyCode === 116) {
        const opciones = {
            path: "gastos/gastos.html",
            ancho: 500,
            altura: 400
        }
        ipcRenderer.send('abrir-ventana', opciones);
    }
});

ventas.addEventListener('click', async e => {
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        console.log(vendedor)
        if (vendedor) {
            location.href = `./venta/index.html?vendedor=${vendedor.nombre}`;
            ipcRenderer.send('sacar-cierre');
        } else if (vendedor === "") {
            await sweet.fire({
                title: "Contraseña incorrecta"
            })
            ventas.click()
        }
    } else {
        location.href = "./venta/index.html";
        ipcRenderer.send('sacar-cierre');
    }
});

clientes.addEventListener('click', async e => {
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor) {
            location.href = `./clientes/clientes.html?vendedor=${vendedor.nombre}&permiso=${vendedor.permiso}`;
            ipcRenderer.send('sacar-cierre');
        } else if (vendedor === "") {
            await sweet.fire({
                title: "Contraseña incorrecta"
            })
            clientes.click()
        }
    } else {
        location.href = `./clientes/clientes.html`;
        ipcRenderer.send('sacar-cierre');
    }

});

productos.addEventListener('click', async e => {
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor) {
            location.href = `./productos/productos.html?vendedor=${vendedor.nombre}&permiso=${vendedor.permiso}`;
            ipcRenderer.send('sacar-cierre');
        } else if (vendedor === "") {
            await sweet.fire({
                title: "Contraseña incorrecta"
            })
            productos.click()
        }
    } else {
        location.href = `./productos/productos.html`;
        ipcRenderer.send('sacar-cierre');
    }
});

caja.addEventListener('click', async e => {
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor) {
            if (vendedor.permiso === 2) {
                sweet.fire({
                    title: "No tiene Permisos para ingresar a Caja"
                })
            } else {
                location.href = `./caja/caja.html?vendedor=${vendedor.nombre}&permiso=${vendedor.permiso}`;
            }
        } else if (vendedor === "") {
            await sweet.fire({
                title: "Contraseña incorrecta"
            })
            caja.click()
        }
    } else {
        location.href = "./caja/caja.html";
    }
});

gastos.addEventListener('click', async e => {
    const { isConfirmed, value } = await Swal.fire({
        title: 'Contraseña',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        input: 'password'
    })

    if (isConfirmed) {
        if (value !== contrasenaGasto) return await Swal.fire('Contraseña Incorrecta', `La contraseña ${value} es incorrecta`, 'error');

        location.href = './gastos/gastos.html';
    }

});

//ponemos un numero para la venta y luego mandamos a imprimirla
ipcRenderer.on('poner-numero', async (e, args) => {
    ponerNumero();
});

ipcRenderer.on('libroIva', async (e, args) => {
    location.href = "./libroIva/libroIva.html";
});

ipcRenderer.on('cartas-empanadas', () => {
    location.href = 'cartas/cartasEmpandas.html'
});

ipcRenderer.on('actualizacion-disponible', () => {
    alert('¡Hay una nueva actualización disponible!');
});

ipcRenderer.on('actualizacion-descargada', () => {
    const reiniciar = confirm('La actualización se ha descargado. ¿Reiniciar ahora?');
    if (reiniciar) {
        ipcRenderer.send('reiniciar-aplicacion');
    }
});