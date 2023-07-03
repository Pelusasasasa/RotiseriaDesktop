const axios = require('axios');
require('dotenv').config();
const URL = process.env.GESTIONURL;
const sweet = require('sweetalert2');

const select = document.getElementById('provedores');
const porcentaje = document.getElementById('porcentaje');
const aceptar = document.getElementById('aceptar');
const salir = document.getElementById('salir');

window.addEventListener('load',async e=>{
    const provedores = (await axios.get(`${URL}productos/provedores`)).data;
    listarProvedores(provedores);
});

aceptar.addEventListener('click',async e=>{
    const mensaje = (await axios.put(`${URL}productos/provedores`,{
        provedor:select.value,
        porcentaje:parseFloat(porcentaje.value)
    })).data;

    await sweet.fire({
        title:mensaje
    });

    window.close();
});


select.addEventListener('keypress',e=>{
   if (e.keyCode === 13) {
    e.preventDefault()
    porcentaje.focus();
   };
});

porcentaje.addEventListener('keypress',e=>{
   if (e.keyCode === 13) {
    aceptar.focus();
   };
});

const listarProvedores = async(lista)=>{
    for await (let elem of lista){
        const option = document.createElement('option');
        option.value = elem.provedor;
        option.text = elem.provedor;

        select.appendChild(option)
    }
};

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
});