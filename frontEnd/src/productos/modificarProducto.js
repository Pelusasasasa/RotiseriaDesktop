require('dotenv').config();
const axios = require('axios');
const { ipcRenderer } = require('electron');
const sweet = require('sweetalert2');
const archivo = require('../configuracion.json');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const {cerrarVentana,apretarEnter, redondear, agregarMovimientoVendedores} = require('../helpers');

const URL = process.env.ROTISERIA_URL;

const codigo = document.querySelector('#codigo');
const descripcion = document.querySelector('#descripcion');
const secciones = document.querySelector('#secciones');
const provedor = document.querySelector('#provedor');
const stock = document.querySelector('#stock');
const img = document.querySelector('#img');
const sinStock = document.querySelector('#sinStock');
const costo = document.querySelector('#costo');
const ganancia = document.querySelector('#ganancia');
const total = document.querySelector('#total');
const modificar = document.querySelector('.modificar');
const salir = document.querySelector('.salir');

const modal = document.getElementById('modal');

let vendedor;

//Recibimos la informacion del producto para luego llenar los inputs
ipcRenderer.on('informacion',async (e,args)=>{
    const {informacion}= args;
    let producto;
    listarSecciones();
    try {
        const { data } = await axios.get(`${URL}producto/${informacion}`);
        if (!data.ok) return await sweet.fire('Error al obtener el producto', data.msg, 'error');
        producto = data.producto;
    } catch (error) {
        console.log(error);
    };
    llenarInputs(informacion,producto);
});

//llenamos los inputs con la informacion que tenemos
const llenarInputs = async(codigoProducto, producto)=>{
    codigo.value = codigoProducto;
    descripcion.value = producto.descripcion;
    provedor.value = producto.provedor;
    stock.value = producto.stock;
    costo.value = producto.costo.toFixed(2);
    ganancia.value = producto.ganancia.toFixed(2);
    secciones.value = producto.seccion?._id;
    total.value = producto.precio.toFixed(2);   
    sinStock.checked = producto.sinStock ? true : false;
}

//al hacer click modificamos los productos con el valor de los inputs
modificar.addEventListener('click',async e=>{
    const formData = new FormData();


    formData.append('_id', codigo.value) ;
    formData.append('descripcion', descripcion.value.trim().toUpperCase());
    formData.append('provedor', provedor.value.trim().toUpperCase());
    formData.append('stock', parseFloat(stock.value));
    formData.append('costo', parseFloat(costo.value));
    formData.append('ganancia', parseFloat(ganancia.value));
    formData.append('seccion', secciones.value);
    formData.append('precio', parseFloat(total.value));
    formData.append('sinStock', sinStock.checked ? true : false);
    
    const archivoImagen = img?.files?.[0];
    if(archivoImagen){
        formData.append('imagen', archivoImagen);
    };

    try {
        modal.classList.remove('none')
        const { data } = await axios.patch(`${URL}producto/${codigo.value}`, formData);
        if( !data.ok) return await sweet.fire('Error al modificar el producto', data.msg, 'error');
        await ipcRenderer.send('informacion-a-ventana',data.productoModificado);
        window.close();
    } catch (error) {
        console.log(error.response.data.msg);
        return await sweet.fire('Error al modificar el producto', error.response.data.msg, 'error');
    }finally{
        modal.classList.add('none');
    };
});

codigo.addEventListener('keypress',e=>{
    apretarEnter(e,descripcion);
});

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,provedor);
});

provedor.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
});

stock.addEventListener('keypress',e=>{
    apretarEnter(e,costo);
});

costo.addEventListener('keypress',e=>{
    apretarEnter(e,total)
});

ganancia.addEventListener('keypress',e=>{
    apretarEnter(e,modificar);
});

total.addEventListener('keypress',e=>{
    apretarEnter(e,ganancia);
});

descripcion.addEventListener('focus',e=>{
    descripcion.select()
});

provedor.addEventListener('focus',e=>{
    provedor.select()
});

stock.addEventListener('focus',e=>{
    stock.select()
});

costo.addEventListener('focus',e=>{
    costo.select()
});

ganancia.addEventListener('focus',e=>{
    ganancia.select();
    if (parseFloat(costo.value) === 0) {
        costo.value = total.value;
    }
    ganancia.value = redondear((parseFloat(total.value) - parseFloat(costo.value)) * 100 / parseFloat(costo.value),2);
});

total.addEventListener('focus',e=>{
    total.select();
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keydown',e=>{
    cerrarVentana(e);
});

async function listarSecciones() {
    try {
        const { data } = await axios.get(`${URL}seccion`);
        if (!data.ok) return await sweet.fire('Error al obtener las secciones', data.msg, 'error');

        for await(let seccion of data.secciones){
            const option = document.createElement('option');
            option.value = seccion._id;
            option.text = seccion.nombre;
            secciones.appendChild(option)
        }
    } catch (error) {
        console.log(error.response.data.msg);
        return await sweet.fire('Error al obtener las secciones', error.response.data.msg, 'error');
    }
    
    
};