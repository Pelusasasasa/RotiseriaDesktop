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

window.addEventListener('load',async e=>{
    cartaEmpanada = JSON.parse(await ipcRenderer.invoke('get-cartaEmpanada'));
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
    if (creado) {
        await ipcRenderer.send('put-CartaEmpanada',cartaEmpanada);
    }else{
        await ipcRenderer.send('post-CartaEmpanada',cartaEmpanada);
    };
    window.close();
};