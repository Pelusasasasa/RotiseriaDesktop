const axios = require("axios");
require('dotenv').config();
const URL = process.env.ROTISERIA_URL;

const sweet = require('sweetalert2');


const codigo = document.getElementById('codigo');
const descripcion = document.getElementById('descripcion');
const nuevoCodigo = document.getElementById('nuevoCodigo');

const modificar = document.getElementById('modificar');
const salir = document.getElementById('salir');

let producto;

codigo.addEventListener('change',async e=>{
    const { data } = (await axios.get(`${URL}producto/${codigo.value}`));
    if(!data.ok) return await sweet.fire('Error al obtener al producto', data.msg, 'error');
    
    if (data.producto) {
        producto = data.producto;
        descripcion.value = data.producto.descripcion;
        nuevoCodigo.focus();
    }
});

nuevoCodigo.addEventListener('change',async e=>{
    try {
        const { data } = (await axios.get(`${URL}producto/${nuevoCodigo.value}`));
        if(!data.ok) return await sweet.fire('Error al obtener al producto', data.msg, 'error');
        await sweet.fire({
            title:"Codigo Ya utilizado"
        });
        nuevoCodigo.value = "";
    } catch (error) {
        console.log(error.response.data);
        modificar.focus();
    };
});

modificar.addEventListener('click',async e=>{
    try {
        await axios.delete(`${URL}producto/${producto._id}`);
        producto._id = nuevoCodigo.value;
        await axios.post(`${URL}producto`,producto);
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

