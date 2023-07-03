const { ipcRenderer } = require("electron");
const { apretarEnter, cerrarVentana } = require("../helpers");
const sweet = require('sweetalert2');

let seleccionado;

const codigo = document.getElementById('codigo');
const nombre = document.getElementById('nombre');

const tbody = document.querySelector('tbody');

//botones
const agregar = document.getElementById('agregar');
const salir = document.getElementById('salir');

window.addEventListener('load',traerSecciones);

tbody.addEventListener('click',clickLista);
agregar.addEventListener('click',agregarSeccion);

async function traerSecciones() {
    const secciones = JSON.parse(await ipcRenderer.invoke('get-secciones'));
    secciones.forEach(seccion => {
        listarSeccion(seccion)
    });
}

async function agregarSeccion() {
    const seccion = {};
    seccion.nombre = nombre.value.toUpperCase();
    seccion.codigo = codigo.value;
    
    listarSeccion(seccion);

    ipcRenderer.send('post-seccion',seccion);

    codigo.value = "";
    nombre.value = "";
    codigo.focus();
};

function listarSeccion(seccion) {
    const tr = `
        <tr id=${seccion.codigo}>
            <td>${seccion.codigo.toString().padStart(4,'0')}</td>
            <td>${seccion.nombre}</td>
            <td class=acciones>
                <div class=tool>
                    <p class=material-icons>edit</p>
                    <span class=tooltip>Modificar</span>
                </div>
                <div class=tool>
                    <p class=material-icons>delete</p>
                    <span class=tooltip>Eliminar</span>
                </div>
            </td>

        </tr>
    `
    tbody.innerHTML += tr;
};

//Funcion que escucha el evento de cuando se hace un click en la lista
async function clickLista(e) {
    if (e.target.innerText === "delete") {
        seleccionado && seleccionado.classList.remove('seleccionado');

        seleccionado = e.target.parentNode.parentNode.parentNode;
        
        seleccionado.classList.add('seleccionado');

        await sweet.fire({
            title:"Eliminar Seccion",
            confirmButtonText:"Aceptar",
            showCancelButton:true
        }).then(async ({isConfirmed})=>{
            if (isConfirmed) {
                eliminarSeccion(seleccionado);
            }
        })
    }else if(e.target.innerText === "edit"){
        seleccionado && seleccionado.classList.remove('seleccionado');

        seleccionado = e.target.parentNode.parentNode.parentNode;
        
        seleccionado.classList.add('seleccionado');
    }else if(e.target.nodeName === "TD"){
        seleccionado && seleccionado.classList.remove('seleccionado');

        seleccionado = e.target.parentNode;
        
        seleccionado.classList.add('seleccionado');
    }
};

//En esta funcion se actia ccuando queremos eliminar una seccion
async function eliminarSeccion(tr){
    const borrar = await ipcRenderer.invoke('delete-seccion',seleccionado.id)
    if (borrar) {
        tbody.removeChild(seleccionado);
    }else{
        sweet.fire({
            title:"No se pudo borrar la seccion"
        })
    }
}   

codigo.addEventListener('keypress',async e=>{
    if ((e.keyCode === 13)) {
        const seccion = JSON.parse(await ipcRenderer.invoke('get-forCodigo-seccion',codigo.value));
        if (seccion) {
            await sweet.fire({
                title:"Codigo ya utilizado"
            });
            codigo.value = "";
        }else{
            nombre.focus();
        }
    }
});

nombre.addEventListener('keypress',e=>{
    if ((e.keyCode === 13)) {
        agregar.focus();
    }
});

salir.addEventListener('click',()=>{
    window.close();
});

document.addEventListener('keyup',cerrarVentana);