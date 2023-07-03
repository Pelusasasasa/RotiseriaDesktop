const axios = require('axios');
const { ipcRenderer } = require('electron');
require("dotenv").config();
const URL = process.env.GESTIONURL;

const sweet = require('sweetalert2');

const {vendedores} = require('../configuracion.json');
const { verificarUsuarios, copiar } = require('../helpers');

let pedidos;

const tbody = document.querySelector('tbody');

const agregar = document.getElementById('agregar');
const salir = document.getElementById('salir');

let seleccionado;
let subSeleccionado;
let inputSeleccionado;

let vendedor = "";

window.addEventListener('load',async e=>{
    copiar();
    if (vendedores) {
        vendedor = await verificarUsuarios();
        if (vendedor === "") {
            await sweet.fire({
                title:"Contraseña Incorrecta"
            });
            location.reload();
        }else if(!vendedor){
            location.href = "../menu.html";
        }
    }
    pedidos = (await axios.get(`${URL}pedidos`)).data;
    await listarPedidos(pedidos);
});

const listarPedidos = async(lista) => {
    for(let pedido of lista){
        const tr = document.createElement('tr');
        
        tr.id = pedido._id;

        const tdFecha = document.createElement('td');
        const tdCodigo = document.createElement('td');
        const tdProducto = document.createElement('td');
        const tdCantidad = document.createElement('td');
        const tdCliente = document.createElement('td');
        const tdTelefono = document.createElement('td');
        const tdStock = document.createElement('td');
        const tdEstadoPedido = document.createElement('td');
        const tdObservaciones = document.createElement('td');
        const tdAcciones = document.createElement('td');
        const tdVendedor = document.createElement('td');

        const inputEstado = document.createElement('input');

        inputEstado.value = pedido.estadoPedido;
        tdAcciones.classList.add('acciones')

        const fecha = pedido.fecha.slice(0,10).split('-',3);

        tdFecha.innerHTML = `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
        tdCodigo.innerHTML = pedido.codigo;
        tdProducto.innerHTML = pedido.producto;
        tdCantidad.innerHTML = pedido.cantidad.toFixed(2);
        tdCliente.innerHTML = pedido.cliente;
        tdTelefono.innerHTML = pedido.telefono;
        tdStock.innerHTML = pedido.stock;
        tdEstadoPedido.appendChild(inputEstado);
        tdObservaciones.innerHTML = pedido.observaciones;
        tdVendedor.innerHTML = pedido.vendedor;
        tdAcciones.innerHTML = `
        <div id=edit class=tool>
            <span id=edit class=material-icons>edit</span>
            <p class=tooltip>Modificar</p>
        </div>
        <div id=delete class=tool>
            <span id=delete class=material-icons>delete</span>
            <p class=tooltip>Eliminar</p>
        </div>
        `

        tr.appendChild(tdFecha);
        tr.appendChild(tdCodigo);
        tr.appendChild(tdProducto);
        tr.appendChild(tdCantidad);
        tr.appendChild(tdCliente);
        tr.appendChild(tdTelefono);
        tr.appendChild(tdStock);
        tr.appendChild(tdEstadoPedido);
        tr.appendChild(tdObservaciones);
        tr.appendChild(tdVendedor);
        tr.appendChild(tdAcciones);

        tbody.appendChild(tr);
    }

    seleccionado = tbody.firstElementChild;
    inputSeleccionado = seleccionado.children[7].children[0];
};

tbody.addEventListener('click',async e=>{
    seleccionado && seleccionado.classList.remove('seleccionado');
    subSeleccionado && subSeleccionado.classList.remove('subSeleccionado');
    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
        subSeleccionado = e.target;
    }else if(e.target.nodeName === "INPUT" || e.target.nodeName === "DIV"){
        seleccionado = e.target.parentNode.parentNode;
        subSeleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "SPAN"){
        seleccionado = e.target.parentNode.parentNode.parentNode;
        subSeleccionado = e.target.parentNode.parentNode;
    }

    inputSeleccionado = seleccionado.children[7].children[0];

    seleccionado.classList.add('seleccionado');
    subSeleccionado.classList.add('subSeleccionado');

    inputSeleccionado.addEventListener('change',async e=>{
        const pedido = pedidos.find(pedido => pedido._id === seleccionado.id);
        pedido.estadoPedido = inputSeleccionado.value.toUpperCase();
        await axios.put(`${URL}pedidos/id/${seleccionado.id}`,pedido);
        location.reload();
    });

    e.target.nodeName === "INPUT" && e.target.select();

    if (e.target.innerHTML === "delete") {
        await sweet.fire({
            title:"Seguro Eliminar pedido?",
            confirmButtonText:"Aceptar",
            showCancelButton:true
        }).then(async({isConfirmed})=>{
            if (isConfirmed) {
                try {
                    await axios.delete(`${URL}pedidos/id/${seleccionado.id}`);
                    tbody.removeChild(seleccionado);
                } catch (error) {
                    sweet.fire({
                        title:"No se puedo eliminar el pedido"
                    })
                }
            }
        })
    }else if(e.target.innerHTML === "edit"){
        ipcRenderer.send('abrir-ventana',{
            path:"pedidos/agregarPedidos.html",
            ancho:500,
            altura:550,
            reinicio:true,
            informacion:seleccionado.id,
            vendedor:vendedor.nombre
        });
    }
    
});


agregar.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana',{
        path:`pedidos/agregarPedidos.html`,
        ancho:500,
        altura:550,
        reinicio:true,
        vendedor:vendedor.nombre
    });
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        location.href = '../menu.html';
    };
})

salir.addEventListener('click',e=>{
    location.href = '../menu.html';
});


