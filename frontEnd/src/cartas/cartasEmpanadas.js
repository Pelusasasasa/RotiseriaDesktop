const sweet = require('sweetalert2');
const axios = require('axios');
require('dotenv').config();
const URL = process.env.ROTISERIA_URL;

const { ipcRenderer } = require("electron");
const { cerrarVentana, apretarEnter } = require("../helpers");

const mediaDocena = document.getElementById('mediaDocena');
const docena = document.getElementById('docena');

const modificar = document.getElementById('modificar');
const guardar = document.getElementById('guardar');
const salir = document.getElementById('salir');

let creado = true;
let cartaEmpanada = {};

modificar.addEventListener('click',sacarDisabled);
guardar.addEventListener('click',modificarCarta);

window.addEventListener('load',async e =>{
    const { data } = await axios.get(`${URL}carta`);
    if(data.ok){
        cartaEmpanada = data.carta;
    }else{
        await sweet.fire('Error Carta Empanada', 'No se pudo obtener la carta de empanadas','error');
    };
     
    if (cartaEmpanada) {
        docena.value = cartaEmpanada.docena.toFixed(2);
        mediaDocena.value = cartaEmpanada.mediaDocena.toFixed(2);
    }else{
        cartaEmpanada = {};
        creado = false;
    }
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    cerrarVentana(e)
});

async function sacarDisabled(){
    const inputs = document.querySelectorAll('input');

    for await(let input of inputs){
        input.removeAttribute('disabled');
    };

    mediaDocena.focus();
    modificar.classList.add('none');
    guardar.classList.remove('none');
};

mediaDocena.addEventListener('keypress',e=>{
    apretarEnter(e,docena);
});

docena.addEventListener('keypress',e=>{
    apretarEnter(e,guardar);
});

mediaDocena.addEventListener('focus',()=>{
    mediaDocena.select();
});

docena.addEventListener('focus',()=>{
    docena.select();
});


async function modificarCarta() {
    cartaEmpanada.docena = docena.value;
    cartaEmpanada.mediaDocena = mediaDocena.value;
    
    const {data} = await axios.patch(`${URL}carta/${cartaEmpanada._id}`, cartaEmpanada);
    if(data.ok){
        await sweet.fire('Modificado', 'Se modificó la carta de empanadas','success');
        window.close();
    }else{
        await sweet.fire('Error Modificado', 'No se pudo modificar la carta de empanadas','error');
    }
};