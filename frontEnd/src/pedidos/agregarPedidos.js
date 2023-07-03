const axios = require('axios');
const { ipcRenderer } = require('electron');
require("dotenv").config();
const URL = process.env.GESTIONURL;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

const sweet = require('sweetalert2');
const { agregarMovimientoVendedores } = require('../helpers');

const title = document.querySelector('title');

const codigo = document.getElementById('codigo');
const descripcion = document.getElementById('descripcion');
const cantidad = document.getElementById('cantidad');
const cliente = document.getElementById('cliente');
const telefono = document.getElementById('telefono');
const stock = document.getElementById('stock');
const observaciones = document.getElementById('observaciones');
const vendedor = document.getElementById('vendedor');

vendedor.value = getParameterByName('vendedor')

const agregar = document.getElementById('agregar');
const modificar = document.getElementById('modificar');
const salir = document.getElementById('salir');

codigo.addEventListener('keypress',async e=>{
    if (e.keyCode === 13 && codigo.value !== "") {
        const producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
        if (producto) {
            listarProducto(producto);
        }
    }
    descripcion.focus();
});

descripcion.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        cantidad.focus();
    }
});

cantidad.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        cliente.focus();
    }
});

cliente.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        telefono.focus();
    }
});

telefono.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        stock.focus();
    }
});

stock.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        observaciones.focus();
    }
});

observaciones.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        if (agregar.classList.contains('none')) {
            modificar.focus();
        }else{
            agregar.focus();
        }
    }
});

const listarProducto = (producto)=>{
    descripcion.value = producto.descripcion;
    stock.value = producto.stock
};

codigo.addEventListener('focus',e=>{
    codigo.select();
});

descripcion.addEventListener('focus',e=>{
    descripcion.select();
});

cantidad.addEventListener('focus',e=>{
    cantidad.select();
});

cliente.addEventListener('focus',e=>{
    cliente.select();
});

telefono.addEventListener('focus',e=>{
    telefono.select();
});

stock.addEventListener('focus',e=>{
    stock.select();
});

observaciones.addEventListener('focus',e=>{
    observaciones.select();
});

agregar.addEventListener('click',async e=>{
    const pedido = {};
    pedido.codigo = codigo.value;
    pedido.producto = descripcion.value.trim().toUpperCase();
    pedido.cantidad = cantidad.value !== "" ? cantidad.value : 0;
    pedido.cliente = cliente.value.toUpperCase();
    pedido.telefono = telefono.value;
    pedido.stock = stock.value;
    pedido.observaciones = observaciones.value.toUpperCase();
    pedido.vendedor = vendedor.value;

    try {
        await axios.post(`${URL}pedidos`,pedido);
        vendedor.value && await agregarMovimientoVendedores(`Agrego el pedido ${pedido.producto} al cliente ${pedido.cliente}`,pedido.vendedor)
        window.close();
    } catch (error) {
        sweet.fire({
            title:"No se pudo cargar el pedido"
        })
    }

});

modificar.addEventListener('click',async e=>{
    const pedido = {};
    pedido.codigo = codigo.value;
    pedido.producto = descripcion.value;
    pedido.cantidad = cantidad.value;
    pedido.cliente = cliente.value.toUpperCase();
    pedido.telefono = telefono.value;
    pedido.stock = stock.value;
    pedido.observaciones = observaciones.value.toUpperCase();
    pedido.vendedor = vendedor.value;
    
    try {
        await axios.put(`${URL}pedidos/id/${modificar.id}`,pedido);
        vendedor.value && await agregarMovimientoVendedores(`Modifico el pedido ${pedido.producto} al cliente ${pedido.cliente}`,pedido.vendedor);
        window.close();
    } catch (error) {
        sweet.fire({
            title:"No se pudo modificar El pedido"
        })
    }
});

salir.addEventListener('click',e=>{
    window.close();
});

ipcRenderer.on('informacion',async (e,args)=>{
    if (args.informacion) {
        const pedido = (await axios.get(`${URL}pedidos/id/${args.informacion}`)).data;
        title.innerHTML = "Modificar Pedido"
        agregar.classList.add('none');
        modificar.classList.remove('none');
        modificar.id = args.informacion;
        listarPedido(pedido);
    }
    if (args.vendedor) {
        vendedor.value = args.vendedor;
    }
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
});

const listarPedido = (pedido)=>{
    codigo.value = pedido.codigo;
    descripcion.value = pedido.producto;
    cantidad.value = pedido.cantidad;
    cliente.value = pedido.cliente;
    telefono.value = pedido.telefono;
    stock.value = pedido.stock;
    observaciones.value = pedido.observaciones;
    vendedor.value = pedido.vendedor;
}

