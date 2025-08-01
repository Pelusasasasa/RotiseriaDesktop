require('dotenv').config();
const axios = require('axios');
const URL = process.env.ROTISERIA_URL;
const sweet = require('sweetalert2');

const { ipcRenderer } = require("electron");
const { cerrarVentana } = require("../helpers");


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
    try {
        const { data } = await axios.get(`${URL}seccion`);
        if (!data.ok) return await sweet.fire('Error al traer secciones', data.msg, 'error');

        data.secciones.forEach(seccion => {
            listarSeccion(seccion)
        });
    } catch (error) {
        console.log(error.response.data.msg);
        return await sweet.fire('Error al traer secciones', error.response.data.msg, 'error');
    };  
}

async function agregarSeccion() {
    const seccion = {};
    seccion.nombre = nombre.value.toUpperCase();
    seccion.codigo = codigo.value;
    

    try {        
        const { data } = await axios.post(`${URL}seccion`, seccion);
        
        if (!data.ok) return await sweet.fire('Error al agregar seccion', data.msg, 'error');

        if(data.ok) {
            listarSeccion(seccion);
        };
        
    } catch (error) {
        console.log(error.response.data.msg);
        await sweet.fire('Error al agregar seccion', error.response.data.msg, 'error');
    }

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
    try {
        const { data } = await axios.delete(`${URL}seccion/${seleccionado.id}`);
        if (!data.ok) return await sweet.fire('Error al eliminar seccion', data.msg, 'error');
        if (data.seccionEliminado) {
            tbody.removeChild(seleccionado);
        }else{
            sweet.fire({
                title:"No se pudo borrar la seccion"
            })
        }
    } catch (error) {
        console.log(error.response.data.msg);
        return await sweet.fire('Error al eliminar seccion', error.response.data.msg, 'error');
    }
    
}   

codigo.addEventListener('keypress',async e=>{
    let seccion;
    if ((e.keyCode === 13)) {
        try {
            const { data } = await axios.get(`${URL}seccion/forCodigo/${codigo.value}`);
            if(!data.ok) return await sweet.fire('Error al buscar seccion', data.msg, 'error');
            seccion = data.seccion;
        } catch (error) {
            console.log(error.response.data.msg);
            await sweet.fire('Error al buscar seccion', error.response.data.msg, 'error');
        }
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