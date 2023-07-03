const axios = require('axios');
const { verificarUsuarios } = require('../helpers');
require('dotenv').config();
const URL = process.env.GESTIONURL;

const sweet = require('sweetalert2');

const {vendedores:verVendedores} = require('../configuracion.json');

const fecha = document.getElementById('fecha');
const select = document.getElementById('vendedores');

const tbody = document.querySelector('tbody');

let vendedores;

window.addEventListener('load',async e=>{

    if (verVendedores) {
        const vendedor = await verificarUsuarios();
        if (vendedor === "") {
            await sweet.fire({
                title:"Contraseña Incorrecta"
            });
            location.reload();
        }else if (!vendedor) {
            window.close();
        }else if(vendedor.permiso !== 0){
            await sweet.fire({title:"Permisos Denegados"});
            window.close();
        };
    }

    const date = new Date()
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    month = month === 13 ? 1 : month

    day = day < 10 ? `0${day}` : day;
    month = month < 10 ? `0${month}` : month;

    fecha.value = `${year}-${month}-${day}`;

    vendedores = (await axios.get(`${URL}vendedores`)).data;
    await listarVendedores(vendedores);

    const movimientos = (await axios.get(`${URL}movVendedores/${fecha.value}/${select.value}`)).data;
    listarMovimientos(movimientos)
});

const listarVendedores = (lista)=>{
    lista.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor.nombre;
        option.text = vendedor.nombre;
        select.appendChild(option)
    });
};

const listarMovimientos = (lista)=>{
    tbody.innerHTML = "";
    lista.forEach(elem =>{
        const tr = document.createElement('tr');

        const fecha = elem.fecha.slice(0,10).split('-',3);
        const hora = elem.fecha.slice(11,19).split(':',3);
        const tdFecha = document.createElement('td');
        const tdDescripcion = document.createElement('td');
        const tdHora = document.createElement('td');
        
        tdFecha.innerHTML = `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
        tdDescripcion.innerHTML = elem.descripcion;
        tdHora.innerHTML = `${hora[0]}:${hora[1]}:${hora[2]}`

        tr.appendChild(tdFecha);
        tr.appendChild(tdDescripcion);
        tr.appendChild(tdHora);

        tbody.appendChild(tr)
    });
};

select.addEventListener('change',async ()=>{
    const movimientos = (await axios.get(`${URL}movVendedores/${fecha.value}/${select.value}`)).data;
    listarMovimientos(movimientos);
});

fecha.addEventListener('change',async ()=>{
    const movimientos = (await axios.get(`${URL}movVendedores/${fecha.value}/${select.value}`)).data;
    listarMovimientos(movimientos);
});

fecha.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        select.focus();
    }
});


document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
})