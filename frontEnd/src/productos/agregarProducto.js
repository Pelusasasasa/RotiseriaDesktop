const axios = require('axios');
require('dotenv').config();
const URL = process.env.ROTISERIA_URL;

const salir = document.querySelector('.salir');
const codigo = document.querySelector('#codigo');
const descripcion = document.querySelector('#descripcion');
const secciones = document.querySelector('#secciones');
const provedor = document.querySelector('#provedor');
const stock = document.querySelector('#stock');
const img = document.querySelector('#img');
const textBold = document.querySelector('#textBold');
const costo = document.querySelector('#costo');
const ganancia = document.querySelector('#ganancia');
const total = document.querySelector('#total');
const guardar = document.querySelector('.guardar');

const modal = document.getElementById('modal');

const sweet  = require('sweetalert2');
const {cerrarVentana,apretarEnter, redondear, agregarMovimientoVendedores} = require('../helpers');

const archivo = require('../configuracion.json');

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

window.addEventListener('load',e=>{
    cargarSelecciones();
})

guardar.addEventListener('click',async ()=>{
    if(secciones.value === '') return await sweet.fire('Elegir una seccion', 'Debe elegir una seccion por defecto', 'error');

    const formData = new FormData();

    formData.append('_id', codigo.value);
    formData.append('descripcion', descripcion.value.trim().toUpperCase());
    formData.append('provedor', provedor.value.toUpperCase().trim());
    formData.append('stock', parseFloat(stock.value));
    formData.append('textBold', textBold.checked === true ? true : false);
    formData.append('costo', parseFloat(costo.value));
    formData.append('ganancia', parseFloat(ganancia.value));
    formData.append('precio', parseFloat(total.value));
    formData.append('seccion', secciones.value);

    const archivoImagen = img?.files?.[0];
    if(archivoImagen){
        formData.append('imagen', archivoImagen);
    };

    try {
        modal.classList.remove('none');
        const { data } = await axios.post(`${URL}producto`, formData);
        if(!data.ok) return await sweet.fire('Error al cargar prodcucto', `${data.msg}`, 'error')

        await sweet.fire('Producto Creado', 'El producto fue creado correctamente', 'success');
        window.close();
    } catch (error) {
        console.log(error);
        console.log(error.response.data.msg);
        await sweet.fire('Error al cargar el producto', error.response.data.msg, 'error');
    }finally{
        modal.classList.add('none');
    };
        
});

codigo.addEventListener('keypress',async e=>{
    if (e.keyCode === 13) {
        let productoYaCreado;
        try {
            const {data} = await axios.get(`${URL}producto/${codigo.value}`);
            if(!data.ok) return sweet.fire('Error al buscar producto', `${data.msg}`, 'error');
            await sweet.fire({
                title:`Codigo ya utilizado en ${data.producto.descripcion}` 
            });
            codigo.value = "";
        } catch (error) {
            descripcion.focus();
        }
    };
});

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,secciones);
});

secciones.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,provedor);
});

provedor.addEventListener('keypress',e=>{
    apretarEnter(e,img);
});

textBold.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
});

stock.addEventListener('keypress',e=>{
    apretarEnter(e,costo);
});

costo.addEventListener('keypress',e=>{
    apretarEnter(e,total)
});

ganancia.addEventListener('keypress',e=>{
    apretarEnter(e,guardar);
});

total.addEventListener('keypress',e=>{
    apretarEnter(e,ganancia);
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keydown',e=>{
    cerrarVentana(e)
});

codigo.addEventListener('focus',e=>{
    codigo.select();
});

descripcion.addEventListener('focus',e=>{
    descripcion.select();
});

provedor.addEventListener('focus',e=>{
    provedor.select();
});

stock.addEventListener('focus',e=>{
    stock.select();
});

costo.addEventListener('focus',e=>{
    costo.select();
});

ganancia.addEventListener('focus',e=>{
    ganancia.select();

    ganancia.value = redondear((parseFloat(total.value) - parseFloat(costo.value)) * 100 / parseFloat(costo.value),2);
});

total.addEventListener('focus',e=>{
    total.select();
});


//Lo usamos para cargar las selecciones
async function cargarSelecciones(){
    const { data } = await axios.get(`${URL}seccion`);
    if(!data.ok) return sweet.fire('Error al cargar secciones', `${data.msg}`, 'error');
    const lista = data.secciones;

    for await (let seccion of lista){
        const option = document.createElement('option');
        option.value = seccion._id;
        option.text = seccion.nombre;
        secciones.appendChild(option)
    }
};
