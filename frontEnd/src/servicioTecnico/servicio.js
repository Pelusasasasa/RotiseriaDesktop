const axios = require('axios');
const { ipcRenderer } = require('electron');
require("dotenv").config();
const URL = process.env.GESTIONURL;
const sweet = require('sweetalert2');
const { verificarUsuarios } = require('../helpers');

const {vendedores} = require('../configuracion.json');

const tbody = document.querySelector('tbody');

//botones
const agregar = document.getElementById('agregar');
const salir = document.getElementById('salir');

let servicios;
let seleccionado;
let subSeleccionado;

let vendedor;

window.addEventListener('load',async e=>{

    if (vendedores) {
        vendedor = await verificarUsuarios();
        if (vendedores && vendedor === "") {
           await sweet.fire({
            title:"Contraseña incorrecta"
           });
           location.reload();
        }else if(vendedores && !vendedor){
            location.href = '../menu.html';
        }
    }

    servicios = (await axios.get(`${URL}servicios`)).data;
    listarServicios(servicios);
});


const listarServicios = (lista)=>{
    for(let servicio of lista){
        const tr = document.createElement('tr');
        tr.id = servicio._id;

        const fechaIngreso  = servicio.fecha.slice(0,10).split('-',3);

        const tdFechaIngreso = document.createElement('td');
        const tdCliente = document.createElement('td');
        const tdTelefono = document.createElement('td');
        const tdDireccion = document.createElement('td');
        const tdProducto = document.createElement('td');
        const tdMarca = document.createElement('td');
        const tdModelo = document.createElement('td');
        const tdNumeroSerie = document.createElement('td');
        const tdDetalles = document.createElement('td');
        const tdImporte = document.createElement('td');
        const tdEgreso = document.createElement('td');
        const tdAcciones = document.createElement('td');

        tdFechaIngreso.innerHTML = `${fechaIngreso[2]}/${fechaIngreso[1]}/${fechaIngreso[0]}`;
        tdCliente.innerHTML = servicio.cliente;
        tdTelefono.innerHTML = servicio.telefono;
        tdDireccion.innerHTML = servicio.direccion;
        tdProducto.innerHTML = servicio.producto;
        tdMarca.innerHTML = servicio.producto;
        tdModelo.innerHTML = servicio.producto;
        tdNumeroSerie.innerHTML = servicio.serie;
        tdDetalles.innerHTML = servicio.detalles;
        tdImporte.innerHTML = servicio.total.toFixed(2);
        tdEgreso.innerHTML = servicio.fechaEgreso;
        tdAcciones.classList.add('acciones');
        tdAcciones.innerHTML = `
            <span id=edit class=material-icons>edit</span>
            <span id=delete class=material-icons>delete</span>

        `

        tr.appendChild(tdFechaIngreso);
        tr.appendChild(tdCliente);
        tr.appendChild(tdTelefono);
        tr.appendChild(tdDireccion);
        tr.appendChild(tdProducto);
        tr.appendChild(tdMarca);
        tr.appendChild(tdModelo);
        tr.appendChild(tdNumeroSerie);
        tr.appendChild(tdDetalles);
        tr.appendChild(tdImporte);
        tr.appendChild(tdEgreso);
        tr.appendChild(tdAcciones);
        
        tbody.appendChild(tr);
    }
};

tbody.addEventListener('click',e=>{
    seleccionado && seleccionado.classList.remove('seleccionado');
    seleccionado = e.target.nodeName === "TD" ? e.target.parentNode : e.target.parentNode.parentNode;
    seleccionado.classList.add('seleccionado');

    subSeleccionado && subSeleccionado.classList.remove('subSeleccionado');
    subSeleccionado = e.target.nodeName === "TD" ? e.target : e.target.parentNode;
    subSeleccionado.classList.add('subSeleccionado');

    if (e.target.id === "delete") {
        sweet.fire({
            title:"Quiere Eliminar el servicio",
            confirmButtonText:"Aceptar",
            showCancelButton:true
        }).then(async({isConfirmed})=>{
            if (isConfirmed) {
                try {
                    await axios.delete(`${URL}servicios/id/${seleccionado.id}`);
                    tbody.removeChild(seleccionado);
                } catch (error) {
                    await sweet.fire({
                        title:"No se pudo eliminar el servicio"
                    });
                }
            }
        })
    }else if(e.target.id === "edit"){
        ipcRenderer.send('abrir-ventana',{
            path:`servicioTecnico/agregarServicio.html`,
            ancho:1200,
            altura:550,
            informacion:seleccionado.id,
            vendedor:vendedor
        })
    }
});

agregar.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana',{
        path:"servicioTecnico/agregarServicio.html",
        ancho:1200,
        altura:550,
        vendedor:vendedor
    })
});

salir.addEventListener('click',e=>{
    location.href = '../menu.html';
});