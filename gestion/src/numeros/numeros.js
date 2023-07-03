const axios = require('axios');
require("dotenv").config();
const URL = process.env.GESTIONURL;

const sweet = require('sweetalert2');

const {vendedores,condIva} = require('../configuracion.json')

const {cerrarVentana, ultimaC, verificarUsuarios, ultimaAB} = require('../helpers');
const { ipcRenderer } = require('electron');

const dolar = document.querySelector('#dolar');
const contado = document.querySelector('#contado');
const cuentaCorriente = document.querySelector('#cuentaCorriente');
const presupuesto = document.querySelector('#presupuesto');
const recibo = document.querySelector('#recibo');
const facturaA = document.querySelector('#facturaA');
const notaA = document.querySelector('#notaA');
const facturaB = document.querySelector('#facturaB');
const notaB = document.querySelector('#notaB');
const facturaC = document.querySelector('#facturaC');
const notaC = document.querySelector('#notaC');

const modificar = document.querySelector('.modificar');
const guardar = document.querySelector('.guardar');
const cargar = document.querySelector('.cargar');
const salir = document.querySelector('.salir');

let id;
let dolarTraido;


window.addEventListener('load',async e=>{
    if (condIva === "Inscripto") {
        facturaC.parentNode.classList.add('none');
        notaC.parentNode.classList.add('none');
    }else{
        facturaA.parentNode.classList.add('none');
        notaA.parentNode.classList.add('none');
        facturaB.parentNode.classList.add('none');
        notaB.parentNode.classList.add('none');
    }
    if (vendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor === "") {
            await sweet.fire({
                title:"Contraseña Incorrecta"
            });
            location.reload();
        }else if (vendedor.permiso !== 0) {
            await sweet.fire({
                title:"Acceso denegado"
            })
            window.close();
        }
    }

    let numeros;
    await ipcRenderer.invoke('gets-numeros').then((result)=>{
        numeros = JSON.parse(result);
    });

    try {
        setTimeout(async()=>{
            let facturas = await ultimaC();
            let facturasAB = await ultimaAB();
            facturaA.value = facturasAB.facturaA;
            facturaB.value = facturasAB.facturaB;
            facturaC.value = facturas.facturaC;
            notaA.value = facturasAB.notaA;
            notaB.value = facturasAB.notaB;
            notaC.value = facturas.notaC;
        },0)
    } catch (error) {
        console.log(error)
    }

    (numeros.Contado === 0 || numeros["Cuenta Corriente"] === 0 || numeros.Recibo === 0 || numeros !== "") && cargar.classList.add('none');
    if (numeros !== "") {
        id = numeros._id;
        dolarTraido = numeros.Dolar;
        dolar.value = numeros.Dolar.toFixed(2);
        presupuesto.value = numeros.Presupuesto.toString().padStart(8,'0');
        contado.value = numeros.Contado.toString().padStart(8,'0');
        recibo.value = numeros.Recibo.toString().padStart(8,'0');
        cuentaCorriente.value = numeros["Cuenta Corriente"].toString().padStart(8,'0');
    }
});

//aca lo que hacemos es poner un boton para que si los numeros no estan cargados se carguen por primera vez
cargar.addEventListener('click',async e=>{
    const numero = {
        "Cuenta Corriente": 0,
        "Contado": 0,
        "Recibo": 0,
        "Dolar":0,
        "Presupuesto":0
    }
    await ipcRenderer.send('post-numeros',numero);
    location.reload();
});

//cuando apretamos habilitamos para que se modifiquen los numeros
modificar.addEventListener('click',e=>{
    modificar.classList.add('none');
    guardar.classList.remove('none');
    dolar.removeAttribute('disabled');
});

//Aca cuando modificamos los numeros despues los guardamos
guardar.addEventListener('click',async e=>{
    const numero = {};
    numero._id = id;
    numero.Contado = parseInt(contado.value);
    numero.Recibo = parseInt(recibo.value);
    numero["Cuenta Corriente"] = parseInt(cuentaCorriente.value);
    numero.Dolar = dolar.value;

    if (dolarTraido !== parseFloat(dolar.value)) {
        await axios.put(`${URL}productos/CambioDolar/${dolar.value}`);
    }

    try {
        await axios.put(`${URL}numero`,numero);
        window.close();
    } catch (error) {
        console.log(error);
        sweet.fire({
            title:"No se pudo modificar la venta"
        })
    }
});

dolar.addEventListener('focus',e=>{
    dolar.select();
});

contado.addEventListener('focus',e=>{
    contado.select();
});

cuentaCorriente.addEventListener('focus',e=>{
    cuentaCorriente.select();
});

recibo.addEventListener('focus',e=>{
    recibo.select();
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    cerrarVentana(e)
});