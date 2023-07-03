const axios = require("axios");
require('dotenv').config();
const URL = process.env.GESTIONURL;

const sweet = require('sweetalert2');


const codigo = document.getElementById('codigo');
const descripcion = document.getElementById('descripcion');
const nuevoCodigo = document.getElementById('nuevoCodigo');

const modificar = document.getElementById('modificar');
const salir = document.getElementById('salir');

let producto;

codigo.addEventListener('change',async e=>{
    producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
    if (producto) {
        descripcion.value = producto.descripcion;
        nuevoCodigo.focus();
    }else{
        await sweet.fire({
            title:"Producto no encontrado"
        });
        codigo.value = "";
    };
    
});

nuevoCodigo.addEventListener('change',async e=>{
    const producto = (await axios.get(`${URL}productos/${nuevoCodigo.value}`)).data;
    console.log(producto)
    if (producto) {
        await sweet.fire({
            title:"Codigo Ya utilizado"
        });
        nuevoCodigo.value = "";
    }else{
        modificar.focus();
    };
});

modificar.addEventListener('click',async e=>{
    try {
        await axios.delete(`${URL}productos/${producto._id}`);
        producto._id = nuevoCodigo.value;
        await axios.post(`${URL}productos`,producto);
        location.reload();
    } catch (error) {
        console.log(error)
        sweet.fire({
            title:"No se pudo cambiar el codigo"
        })
    }
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
});

salir.addEventListener('click',e=>{
        window.close();
});

