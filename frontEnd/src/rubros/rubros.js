const axios = require('axios');
require("dotenv").config();
const URL = process.env.GESTIONURL;
const sweet = require('sweetalert2');

const tbody = document.querySelector('tbody');
const numero = document.querySelector('#numero');
const nombre = document.querySelector('#nombre');
const agregar = document.querySelector('.agregar');
const modificar = document.querySelector('.modificar');

let seleccionado = "";

window.addEventListener('load',async e=>{
    numero.value = (await axios.get(`${URL}rubro/id`)).data;
    const rubros = (await axios.get(`${URL}rubro`)).data;
    listar(rubros);
});

//Funcion que lista todos los rubros pasados por parametros
const listar = async(rubros)=>{
    for await(let {_id,numero,rubro} of rubros){
        const tr = document.createElement('tr');
        tr.id = _id;

        const tdNumero = document.createElement('td');
        const tdNombre = document.createElement('td');
        const tdAcciones = document.createElement('td');

        tdAcciones.classList.add('acciones');

        tdNumero.innerHTML = numero;
        tdNombre.innerHTML = rubro;
        tdAcciones.innerHTML = `
            <div class=tool>
                <span class=material-icons>edit</span>
                <p class=tooltip>Modificar</p>
            </div>
            <div class=tool>
                <span class=material-icons>delete</span>
                <p class=tooltip>Eliminar</p>
            </div>
        `

        tr.appendChild(tdNumero);
        tr.appendChild(tdNombre);
        tr.appendChild(tdAcciones);

        tbody.appendChild(tr);
    }
};

agregar.addEventListener('click',async e=>{
    if (nombre.value !== "") {
        const nuevoRubro = {
            rubro:nombre.value,
            numero:numero.value
        };
        await axios.post(`${URL}rubro`,nuevoRubro);
        tbody.innerHTML = "";
        location.reload();
    }else{
        await sweet.fire({
            title:"Debe agregar un nombre al Rubro",
            returnFocus:false
        });
    }
    nombre.value = "";
    nombre.focus();
});

tbody.addEventListener('click',async e=>{

    seleccionado && seleccionado.classList.remove('seleccionado');

    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "SPAN"){
        seleccionado = e.target.parentNode.parentNode.parentNode;
    }else if(e.target.nodeName === "DIV"){
        seleccionado = e.target.parentNode.parentNode;
    }
    seleccionado.classList.add('seleccionado');

    agregar.classList.add('none');
    modificar.classList.remove('none');
    numero.value = seleccionado.children[0].innerHTML;
    nombre.value = seleccionado.children[1].innerHTML;

    if (e.target.innerHTML === "edit") {
        
    }else if(e.target.innerHTML === "delete"){
        await sweet.fire({
            title:"Eliminar Rubro ?",
            showCancelButton:true,
            confirmButtonText:"Aceptar"
        }).then(async({isConfirmed})=>{
            if (isConfirmed) {
                try {
                    await axios.delete(`${URL}rubro/codigo/${seleccionado.id}`);
                    tbody.removeChild(seleccionado);
                    nombre.value = "";
                    modificar.classList.add('none');
                    agregar.classList.remove('none');
                } catch (error) {
                    console.log(error);
                    sweet.fire({
                        title:"No se pudo borrar el rubro"
                    })
                }
            }
        });
    }
});

modificar.addEventListener('click',e=>{
    if(nombre.value !== ""){
        const rubroModificado = {
            rubro: nombre.value,
            numero:numero.value
        }
        axios.put(`${URL}rubro/${numero.value}`,rubroModificado);
        tbody.innerHTML = "";
        location.reload();
    }
});


document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {
        window.close();
    }
});

nombre.addEventListener('keypress',e=>{
   if (e.keyCode === 13) {
    if (agregar.classList.contains('none')) {
        modificar.focus();
    }else{
        agregar.focus();
    }
   }
});

nombre.addEventListener('focus',e=>{
    nombre.select();
});