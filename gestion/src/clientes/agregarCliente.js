const {cerrarVentana,apretarEnter, agregarMovimientoVendedores} = require('../helpers');
const sweet = require('sweetalert2');
const {default:validarCuit} = require('cuit-validator');

// const { ipcRenderer } = require('electron');
// require("dotenv").config();
// const URL = process.env.GESTIONURL;

const { ipcRenderer } = require('electron');

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

window.addEventListener('load',async e=>{
    // const id = (await axios.get(`${URL}clientes`)).data;
    ipcRenderer.invoke('ultimo-Id-Cliente').then((id)=>{
        codigo.value = id + 1;
    });
});

// ipcRenderer.on('informacion',(e,args)=>{
//     vendedor = args.vendedor;
// });


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

agregar.addEventListener('click',async e=>{
    const cliente = {};
    cliente._id = parseFloat(codigo.value);
    cliente.nombre = nombre.value.trim().toUpperCase();
    cliente.localidad = localidad.value.trim().toUpperCase();
    cliente.telefono = telefono.value.trim();
    cliente.direccion = direccion.value.trim().toUpperCase();
    cliente.cuit = cuit.value;
    cliente.condicionIva = condicionIva.value;
    cliente.condicionFacturacion = parseFloat(condicionFacturacion.value);
    cliente.saldo = 0;
    cliente.observaciones = observaciones.value.trim().toUpperCase();

    ipcRenderer.send('agregar-cliente',JSON.stringify(cliente));
    window.close();
    // try {
    //     const {mensaje,estado} = (await axios.post(`${URL}clientes`,cliente)).data;
    //     vendedor && await agregarMovimientoVendedores(`Agrego el  liente ${cliente.nombre} con direccion ${cliente.direccion}`,vendedor);
    //     await sweet.fire({
    //         title:mensaje
    //     });
    //     if (estado) {
    //         window.close();
    //     }
    // } catch (error) {
    //     console.log(error)
    //     sweet.fire({
    //         title:"No se pudo agregar un cliente"
    //     })
    // }

});

salir.addEventListener('click',e=>{
    window.close();
});