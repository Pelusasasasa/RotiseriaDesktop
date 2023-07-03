const sweet = require('sweetalert2');
const { ipcRenderer } = require('electron');
const {cerrarVentana,apretarEnter,selecciona_value, agregarMovimientoVendedores} = require('../helpers');

// const axios = require('axios');
// require("dotenv").config();
// const URL = process.env.GESTIONURL;

let vendedor;

ipcRenderer.on('informacion',async(e,{informacion,vendedor:vende})=>{
    let cliente;
    await ipcRenderer.invoke('get-cliente',informacion).then((result)=>{
        cliente = JSON.parse(result)
    });
    ponerInputs(informacion,cliente);
    vendedor = vende;
});

const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const localidad = document.querySelector('#localidad');
const telefono = document.querySelector('#telefono');
const direccion = document.querySelector('#direccion');
const cuit = document.querySelector('#cuit');
const condicionIva = document.querySelector('#condicion');
const condicionFacturacion = document.querySelector('#condicionFacturacion');
const observaciones = document.querySelector('#observaciones');
const modificar = document.querySelector('.modificar');
const salir = document.querySelector('.salir');

const ponerInputs = async(id,cliente)=>{
    codigo.value = id;
    nombre.value = cliente.nombre;
    localidad.value = cliente.localidad;
    direccion.value = cliente.direccion;
    telefono.value = cliente.telefono;
    cuit.value = cliente.cuit ? cliente.cuit : "";
    condicionIva.value = cliente.condicionIva ? cliente.condicionIva : "Consumidor Final";
    condicionFacturacion.value = cliente.condicionFacturacion;
    observaciones.value = cliente.observaciones;
}

nombre.addEventListener('keypress',e=>{
    apretarEnter(e,condicionFacturacion);
});

condicionFacturacion.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,localidad);
});

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
    apretarEnter(e,condicionIva);
});

condicionIva.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,observaciones);
});

observaciones.addEventListener('keypress',e=>{
    apretarEnter(e,modificar);
});


nombre.addEventListener('focus',e=>{
    nombre.select();
});

localidad.addEventListener('focus',e=>{
    localidad.select();
});

telefono.addEventListener('focus',e=>{
    telefono.select();
});

direccion.addEventListener('focus',e=>{
    direccion.select();
});

cuit.addEventListener('focus',e=>{
    cuit.select();
});

observaciones.addEventListener('focus',e=>{
    observaciones.select();
});


modificar.addEventListener('click',async e=>{
    const cliente = {};
    cliente._id = parseFloat(codigo.value);
    cliente.nombre = nombre.value.toUpperCase();
    cliente.localidad = localidad.value.toUpperCase();
    cliente.telefono = telefono.value;
    cliente.direccion = direccion.value.toUpperCase();
    cliente.condicionFacturacion = parseFloat(condicionFacturacion.value);
    cliente.cuit = cuit.value;
    cliente.saldo = 0;
    cliente.condicionIva = condicionIva.value;
    cliente.observaciones = observaciones.value.toUpperCase();
    
    ipcRenderer.send('put-cliente',cliente);
    ipcRenderer.send('enviar-ventana-principal',cliente);
    window.close();
    // try {
    //     const mensaje = (await axios.put(`${URL}clientes/id/${cliente._id}`,cliente)).data;
    //     vendedor && await agregarMovimientoVendedores(`Modifico el cliente ${cliente.nombre} con direccion en ${cliente.direccion}`,vendedor);
    //     await sweet.fire({title:mensaje});
    //     ipcRenderer.send('enviar-ventana-principal',cliente);
    //     window.close();
    // } catch (error) {
    //     sweet.fire({title:"No se pudo modificar el cliente"});
    //     console.log(error)
    // }
})

document.addEventListener('keydown',e=>{
    cerrarVentana(e);
});

salir.addEventListener('click',e=>{
    window.close();
})