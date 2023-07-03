const axios = require('axios');
require("dotenv").config();
const URL = process.env.GESTIONURL;

const { ipcRenderer } = require('electron');
const sweet = require('sweetalert2');

const {agregarMovimientoVendedores} = require('../helpers')

const idCliente = document.getElementById('idCliente');
const cliente = document.getElementById('cliente');
const direccion = document.getElementById('direccion');
const telefono = document.getElementById('telefono');

const producto = document.getElementById('producto');
const modelo = document.getElementById('modelo');
const marca = document.getElementById('marca');
const serie = document.getElementById('serie');
const detalles = document.getElementById('detalles');

const egreso = document.querySelector('.egreso');
const inputEgreso = document.getElementById('fechaEgreso');
const total = document.getElementById('total');
const vendedor = document.getElementById('vendedor');

const agregar = document.getElementById('agregar');
const modificar = document.getElementById('modificar');
const salir = document.getElementById('salir');

let servicio;

ipcRenderer.on('informacion',async (e,args)=>{
    vendedor.value = args.vendedor.nombre;
    if (args.informacion) {
        servicio = (await axios.get(`${URL}servicios/id/${args.informacion}`)).data;
        listarServicio(servicio);

        egreso.classList.remove('none');

        const fechaEgreso = new Date();
        let day = fechaEgreso.getDate();
        let month = fechaEgreso.getMonth() + 1;
        let year = fechaEgreso.getFullYear();

        month = month === 13 ? 1 : month;
        day = day < 10 ? `0${day}` : day;
        month = month < 10 ? `0${month}` : month;
        inputEgreso.value = `${year}-${month}-${day}`;

        modificar.classList.remove('none');
        modificar.id = args.informacion;
        agregar.classList.add('none');
    }
});

const listarServicio = (servicio)=>{
    cliente.value = servicio.cliente;
    direccion.vlaue = servicio.direccion;
    telefono.value = servicio.telefono;
    idCliente.value = servicio.idCliente;

    producto.value = servicio.producto;
    modelo.value = servicio.modelo;
    marca.value = servicio.marca;
    serie.value = servicio.numeroSerie;
    detalles.value = servicio.detalles;

    vendedor.value = servicio.vendedor;
}

idCliente.addEventListener('keypress',async e=>{
    if (e.keyCode === 13 && idCliente.value !== "") {
        const cliente = (await axios.get(`${URL}clientes/id/${idCliente.value}`)).data;
        if (cliente) {
            listarCliente(cliente);
            producto.focus();
        }else{
            await sweet.fire({
                title:"Cliente no encontrado"
            });
            idCliente.value = "";
        }
    }else if(e.keyCode === 13 && idCliente.value === ""){
        idCliente.value = "0000";
        cliente.focus();
    };
});

cliente.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        direccion.focus();
    }
});

direccion.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        telefono.focus();
    }
});

telefono.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        producto.focus();
    }
});

producto.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        modelo.focus();
    }
});

modelo.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        marca.focus();
    }
});

marca.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        serie.focus();
    }
});

const listarCliente = (elem)=>{
    cliente.value = elem.nombre;
    direccion.value = elem.direccion;
    telefono.value = elem.telefono;
}

agregar.addEventListener('click',async e=>{
    const servicio = {};
    servicio.idCliente = idCliente.value;
    servicio.cliente = cliente.value.toUpperCase();
    servicio.direccion = direccion.value.toUpperCase();
    servicio.telefono = telefono.value;

    servicio.producto = producto.value.toUpperCase();
    servicio.modelo = modelo.value.toUpperCase();
    servicio.marca = marca.value.toUpperCase();
    servicio.serie = serie.value;

    servicio.total = total.value;
    servicio.vendedor = vendedor.value;

    servicio.detalles = detalles.value.toUpperCase();
    
    try {
        await axios.post(`${URL}servicios`,servicio);
        window.close();
    } catch (error) {
        await sweet.fire({
            title:"No se pudo cargar el servicio"
        })
    }
});

modificar.addEventListener('click',async e=>{
    const servicioNuevo = {};
    servicioNuevo.idCliente = idCliente.value;
    servicioNuevo.cliente = cliente.value.toUpperCase();
    servicioNuevo.direccion = direccion.value.toUpperCase();
    servicioNuevo.telefono = telefono.value;

    servicioNuevo.producto = producto.value.toUpperCase();
    servicioNuevo.modelo = modelo.value.toUpperCase();
    servicioNuevo.marca = marca.value.toUpperCase();
    servicioNuevo.serie = serie.value;

    servicioNuevo.detalles = detalles.value.toUpperCase();

    servicioNuevo.fechaEgreso = inputEgreso.value;
    servicioNuevo.total = total.value;
    servicio.vendedor = vendedor.value;


    vendedor.value && await modificacionesEnServicios(servicio,servicioNuevo)
    try {
        await axios.put(`${URL}servicios/id/${modificar.id}`,servicioNuevo);
        window.close();
    } catch (error) {
        sweet.fire({
            title:"No se pudo modificar el servicio"
        })
    }
});


const modificacionesEnServicios = async(servicioViejo,servicioNuevo)=>{
    if (servicioViejo.cliente !== servicioNuevo.cliente) {
        await agregarMovimientoVendedores(`Se modifico el cliente ${servicioViejo.cliente} a ${servicioNuevo.cliente}`,vendedor.value);
    }
    if (servicioViejo.detalles !== servicioNuevo.detalles) {
        await agregarMovimientoVendedores(`Se modifico el detalle ${servicioViejo.detalles} a ${servicioNuevo.detalles}`,vendedor.value);
    }
    if (servicioViejo.marca !== servicioNuevo.marca) {
        await agregarMovimientoVendedores(`Se modifico la marca ${servicioViejo.marca} a ${servicioNuevo.marca}`,vendedor.value);
    }
    if (servicioViejo.modelo !== servicioNuevo.modelo) {
        await agregarMovimientoVendedores(`Se modifico el modelo ${servicioViejo.modelo} a ${servicioNuevo.modelo}`,vendedor.value);
    }
    if (servicioViejo.producto !== servicioNuevo.producto) {
        await agregarMovimientoVendedores(`Se modifico el prodcuto ${servicioViejo.producto} a ${servicioNuevo.producto}`,vendedor.value);
    }
    if (servicioViejo.serie !== servicioNuevo.serie) {
        await agregarMovimientoVendedores(`Se modifico el numero de serie ${servicioViejo.serie} a ${servicioNuevo.serie}`,vendedor.value);
    }
    if (servicioViejo.telefono !== servicioNuevo.telefono) {
        await agregarMovimientoVendedores(`Se modifico el telefono ${servicioViejo.telefono} a ${servicioNuevo.telefono}`,vendedor.value);
    }
    if (servicioViejo.total !== servicioNuevo.total) {
        await agregarMovimientoVendedores(`Se modifico el total ${servicioViejo.total} a ${servicioNuevo.total}`,vendedor.value);
    }
    if (servicioViejo.direccion !== servicioNuevo.direccion) {
        await agregarMovimientoVendedores(`Se modifico la direccion ${servicioViejo.direccion} a ${servicioNuevo.direccion}`,vendedor.value);
    }
}

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
});