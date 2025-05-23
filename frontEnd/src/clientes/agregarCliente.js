
const {cerrarVentana,apretarEnter, agregarMovimientoVendedores} = require('../helpers');
const {default:validarCuit} = require('cuit-validator');

const sweet = require('sweetalert2');
const axios = require('axios');

require("dotenv").config();
const URL = process.env.ROTISERIA_URL;

const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const localidad = document.querySelector('#localidad');
const telefono = document.querySelector('#telefono');
const direccion = document.querySelector('#direccion');
const cuit = document.querySelector('#cuit');
const condicionIva = document.querySelector('#condicion');
const condicionFacturacion = document.querySelector('#condicionFacturacion');
const observaciones = document.querySelector('#observaciones');
const agregar = document.querySelector('.agregar');
const salir = document.querySelector('.salir');

let vendedor;

agregar.addEventListener('click',async e=>{
    const cliente = {};
    cliente.nombre = nombre.value.trim().toUpperCase();
    cliente.localidad = localidad.value.trim().toUpperCase();
    cliente.telefono = telefono.value.trim();
    cliente.direccion = direccion.value.trim().toUpperCase();
    cliente.cuit = cuit.value;
    cliente.condicionIva = condicionIva.value;
    cliente.condicionFacturacion = parseFloat(condicionFacturacion.value);
    cliente.saldo = 0;
    cliente.observaciones = observaciones.value.trim().toUpperCase();

    const { data } = await axios.post(`${URL}cliente`, cliente);
    console.log(data);
    if(!data.ok){
        await sweet.fire('Error al cargar Cliente', data.msg, 'error');;
    }else{
        await sweet.fire('Cliente Agregado', data.cliente.nombre, 'success');
    }
    window.close();
});


nombre.addEventListener('keypress',e=>{
    apretarEnter(e,condicionFacturacion);
});

condicionFacturacion.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,localidad);
})

localidad.addEventListener('keypress',e=>{
    apretarEnter(e,telefono);
});

telefono.addEventListener('keypress',e=>{
    apretarEnter(e,direccion);
});

direccion.addEventListener('keypress',e=>{
    apretarEnter(e,cuit);
});

cuit.addEventListener('keypress',e=>{
    apretarEnter(e,condicion);
});

condicion.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,observaciones);
});

observaciones.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,agregar);
});

document.addEventListener('keydown',e=>{
    cerrarVentana(e)
});

cuit.addEventListener('blur',async e=>{
    if (cuit.value.length === 11) {
        if (!validarCuit(cuit.value)) {
            await sweet.fire({
                title:"El cuit no es correcto"
            });
            cuit.value = "";
            cuit.focus();
        }
    }else if(cuit.value.length !== 8 && cuit.value.length !== 0 && cuit.value !== "00000000"){
        await sweet.fire({
            title:"Cuit o DNI no valido"
        });
        cuit.value = "";
        cuit.focus();
    }
});


salir.addEventListener('click',e=>{
    window.close();
});