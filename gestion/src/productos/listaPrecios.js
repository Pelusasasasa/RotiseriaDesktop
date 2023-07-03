let XLSX = require('xlsx');
const axios = require('axios');
require('dotenv').process;
const URL = process.env.GESTIONURL;
console.log(URL)

const {dialog} = require('electron')

const { redondear } = require('../helpers');
const path = require('path');
const { ipcRenderer } = require('electron/renderer');

const descargar = document.getElementById('descargar');
const listar = document.querySelector('.listar');


window.addEventListener('load',async e=>{
    const marcas = (await axios.get(`${URL}productos/marcas`)).data;
    listarMarcas(marcas);
});

const listarMarcas = (lista)=>{
    listar.innerHTML = "";
    lista.forEach(element => {
        listar.innerHTML += `
        <div>
            <label for="${element}">${element}</label>
            <input type="checkbox" name=marca id="${element}" />
        </div>
        ` 
    });
};

descargar.addEventListener('click',async e=>{
    ipcRenderer.invoke('saveDialog').then( async args=>{
       const path = args;
    const marcas = document.querySelectorAll('input[name=marca]')
    let marcasCheckeadas = [];
    for(let marca of marcas){
        if (marca.checked) {
            marcasCheckeadas.push(marca.id)
        }
    }
    const productos = (await axios.get(`${URL}productos/productosPorMarcas/${JSON.stringify(marcasCheckeadas)}`)).data;
    productos.forEach(producto => {
        delete producto.rubro;
        delete producto._id;
        delete producto.__v;
        delete producto.ganancia;
        delete producto.precio;
        delete producto.costo;
        delete producto.stock;
        producto.costoMasIva = redondear(producto.costoDolar*producto.impuesto/100 + producto.costoDolar,2);
    });

    let wb = XLSX.utils.book_new();
    wb.props = {
        Title:"Lista Precios",
    };

    let newWs = XLSX.utils.json_to_sheet(productos);
    XLSX.utils.book_append_sheet(wb,newWs,'Productos');
    const ruta = path.endsWith('.xlsx') ? path : path + ".xlsx";
    XLSX.writeFile(wb,ruta);

    });
});