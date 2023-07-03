const { ipcRenderer } = require("electron");
const sweet = require('sweetalert2');

// const axios = require('axios');
// require("dotenv").config();
// const URL = process.env.GESTIONURL;

const archivo = require('./configuracion.json');

ipcRenderer.send('poner-cierre');

const {abrirVentana, ponerNumero, cargarVendedor, verificarUsuarios} = require('./helpers');

const ventas = document.querySelector('.ventas');
const clientes = document.querySelector('.clientes');
const caja = document.querySelector('.caja');
const productos = document.querySelector('.productos');
const movimiento = document.querySelector('.movimiento');
const consulta = document.querySelector('.consulta');
const recibo = document.querySelector('.recibo');
const notaCredito = document.querySelector('.notaCredito');

let verVendedores;

window.addEventListener('load',async e=>{
    await ipcRenderer.send('cargar-numero-pedido');
    ipcRenderer.invoke('get-numero-pedido').then((result)=>{
        const pedido = JSON.parse(result)
        const diaPedido = pedido.fecha.slice(8,10)
        const fecha = new Date();
        const hoy = (new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString());
        const diaHoy = hoy.slice(8,10)
        if(!(diaPedido === diaHoy)){
            pedido.numero = 0;
            console.log("a")
            pedido.fecha = hoy;
            ipcRenderer.send('put-pedido',pedido);
        }
    });

//     await cargarPrimerCliente();
//     verVendedores = archivo.vendedores;
//     const vendedores = (await axios.get(`${URL}vendedores`)).data;
//     if (!vendedores.find(vendedor => vendedor.permiso === 0) && verVendedores) {
//         sweet.fire({
//             title:"Cargar un Vendedor con permiso en 0 inicial",
//             html: await cargarVendedor(),
//             confirmButtonText:"Aceptar",
//             showCancelButton:true
//         }).then(async({isConfirmed})=>{
//             if (isConfirmed) {
//                 const nuevoVendedor = {};
//                 nuevoVendedor.codigo = document.getElementById('codigo').value;
//                 nuevoVendedor.nombre = document.getElementById('nombre').value.toUpperCase();
//                 nuevoVendedor.permiso = document.getElementById('permisos').value;
//                 try {
//                     await axios.post(`${URL}vendedores`,nuevoVendedor);
//                 } catch (error) {
//                     sweet.fire({
//                         title:"no se pudo cargar el vendedor"
//                     })
//                 }
//             }else{
//                 location.reload();
//             }
//         })
//     }
});

//Al tocar el atajo de teclado, abrimos ventanas
document.addEventListener('keyup',async e=>{
    if (e.keyCode === 112) {
        ventas.click()
    }else if(e.keyCode === 113){
        const opciones = {
            path:"clientes/agregarCliente.html",
            ancho:1200,
            altura:500
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }else if(e.keyCode === 114){
        const opciones = {
            path:"productos/agregarProducto.html",
            ancho:1200,
            altura:550
        };
        ipcRenderer.send('abrir-ventana',opciones);
    }else if(e.keyCode === 115){
        const opciones = {
            path: "productos/cambio.html",
            ancho: 1000,
            altura:550
        }
        ipcRenderer.send('abrir-ventana',opciones)
    }else if(e.keyCode === 116){
        const opciones = {
            path:"gastos/gastos.html",
            ancho:500,
            altura:400
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }
});


ventas.addEventListener('click',async e=>{
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        console.log(vendedor)
        if (vendedor) {
            location.href = `./venta/index.html?vendedor=${vendedor.nombre}`;
            ipcRenderer.send('sacar-cierre');
        }else if(vendedor === ""){
            await sweet.fire({
                title:"Contraseña incorrecta"
            })
            ventas.click()
        }
    }else{
        location.href = "./venta/index.html";
        ipcRenderer.send('sacar-cierre');
    }
});


clientes.addEventListener('click',async e=>{
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor) {
            location.href = `./clientes/clientes.html?vendedor=${vendedor.nombre}&permiso=${vendedor.permiso}`;
            ipcRenderer.send('sacar-cierre');
        }else if(vendedor === ""){
            await sweet.fire({
                title:"Contraseña incorrecta"
            })
            clientes.click()
        }
    }else{
        location.href = `./clientes/clientes.html`;
        ipcRenderer.send('sacar-cierre');
    }
    
});


productos.addEventListener('click',async e=>{
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor) {
            location.href = `./productos/productos.html?vendedor=${vendedor.nombre}&permiso=${vendedor.permiso}`;
            ipcRenderer.send('sacar-cierre');
        }else if(vendedor === ""){
            await sweet.fire({
                title:"Contraseña incorrecta"
            })
            productos.click()
        }
    }else{
        location.href = `./productos/productos.html`;
        ipcRenderer.send('sacar-cierre');
    }
});

caja.addEventListener('click',async e=>{
    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor) {
            if (vendedor.permiso === 2) {
                sweet.fire({
                    title:"No tiene Permisos para ingresar a Caja"
                })
            }else{
                location.href = `./caja/caja.html?vendedor=${vendedor.nombre}&permiso=${vendedor.permiso}`;    
            }
        }else if(vendedor === ""){
            await sweet.fire({
                title:"Contraseña incorrecta"
            })
            caja.click()
        }
    }else{
        location.href = "./caja/caja.html";
    }
});

// movimiento.addEventListener('click',e=>{
//     location.href = "./movimiento/movimiento.html";
// });

// consulta.addEventListener('click',e=>{
//     location.href = "./consultarCuenta/consultarCuenta.html";
// });

// recibo.addEventListener('click',async e=>{
//     if (verVendedores) {
//         const vendedor = await verificarUsuarios();
//         if (vendedor) {
//             location.href = `./recibo/recibo.html?vendedor=${vendedor.nombre}`;
//             ipcRenderer.send('sacar-cierre');
//         }else if(vendedor === ""){
//             await sweet.fire({
//                 title:"Contraseña incorrecta"
//             })
//             clientes.click()
//         }
//     }else{
//         location.href = "./recibo/recibo.html";
//         ipcRenderer.send('sacar-cierre');
//     }
// });

// notaCredito.addEventListener('click',e=>{
//     location.href = "./venta/index.html?tipoFactura=notaCredito";
//     ipcRenderer.send('sacar-cierre');
// });

//ponemos un numero para la venta y luego mandamos a imprimirla
ipcRenderer.on('poner-numero',async (e,args)=>{
    ponerNumero();
});

ipcRenderer.on('libroIva',async (e,args)=>{
    location.href = "./libroIva/libroIva.html";
});

const cargarPrimerCliente = async()=>{
    const id = (await axios.get(`${URL}clientes`)).data;
    if (id === 1) {
        const cliente = {};
        cliente._id = 1;
        cliente.nombre = "Consumidor Final";
        cliente.telefono = "";
        cliente.direccion = "CHAJARI";
        cliente.localidad = "CHAJARI";
        cliente.cuit = "00000000";
        cliente.condicionFacturacion = 2;

        try {
            await axios.post(`${URL}clientes`,cliente);
        } catch (error) {
            console.log(error);
            await sweet.fire({
                title:"No se pudo cargar el primer cliene, cargarlo normal"
            })
        }
    }
}