
let vendedor
const {cerrarVentana,apretarEnter, verificarUsuarios, agregarMovimientoVendedores} = require('../helpers');
const sweet = require('sweetalert2');

const axios = require('axios');
const { ipcRenderer } = require('electron');
require("dotenv").config();
const URL = process.env.GESTIONURL;

const {vendedores} = require('../configuracion.json')

const codigo = document.getElementById('id');
const nombre = document.getElementById('nombre');
const saldoViejo = document.getElementById('saldoViejo');
const saldoNuevo = document.getElementById('saldoNuevo');

//botones
const modificar = document.querySelector('.modificar');
const salir = document.querySelector('.salir');

let cliente;

window.addEventListener('load',async e=>{
    if (vendedores) {
        vendedor = await verificarUsuarios();
        if (vendedor === "") {
            await sweet.fire({
                title:"Contraseña incorrecta"
            });
            location.reload();
        }else if(vendedor.permiso !== 0){
            await sweet.fire({
                title:"Acceso denegado"
            });
            window.close();
        }
    }
});

const listarCliente = async(cliente)=>{
    nombre.value = cliente.nombre;
    saldoViejo.value = cliente.saldo.toFixed(2);
}

codigo.addEventListener('keyup',async e=>{
    console.log(e.keyCode)
    if (e.keyCode === 13 && codigo.value !== "") {
        cliente = (await axios.get(`${URL}clientes/id/${codigo.value}`)).data;
        if (cliente) {
            listarCliente(cliente);
            saldoNuevo.focus();
        }else{
            await sweet.fire({
                title:"Cliente No Econtrado"
            });
            codigo.value = "";
            codigo.focus();
        }
    }
});


modificar.addEventListener('click',async e=>{
    try {
        cliente.saldo = saldoNuevo.value;
        (await axios.put(`${URL}clientes/id/${cliente._id}`,cliente));
        vendedor && await agregarMovimientoVendedores(`Modifico el saldo del cliente ${cliente.nombre} de ${saldoViejo.value} a ${saldoNuevo.value}`,vendedor);
        window.close();
    } catch (error) {
        console.log(error)
        sweet.fire({
            title:"No se pudo modificar el saldo"
        })
    }
});

saldoNuevo.addEventListener('keyup',e=>{
    if (e.keyCode === 13) {
        saldoNuevo.value = saldoNuevo.value !== "" ? saldoNuevo.value : saldoViejo.value;
        modificar.focus();
    }
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    } 
});

salir.addEventListener('click',e=>{
    window.close();
})