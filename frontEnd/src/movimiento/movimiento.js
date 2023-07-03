//Controlado 8/09/2022
const axios = require('axios');
require("dotenv").config();
const URL = process.env.GESTIONURL;

const select = document.querySelector('#rubro');
const tbody = document.querySelector('tbody');
const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const esteMes = document.querySelector('.mes');
const total = document.querySelector('#total');

const hoy = new Date();
let dia = hoy.getDate();
let mes = hoy.getMonth() + 1;
let anio = hoy.getFullYear();

dia = dia<10 ? `0${dia}` : dia;
mes = mes<10 ? `0${mes}` : mes;
mes = mes === 13 ? 1 : mes;

desde.value = `${anio}-${mes}-${dia}`;
hasta.value = `${anio}-${mes}-${dia}`;

window.addEventListener('load',async e => {
    const rubros = (await axios.get(`${URL}rubro`)).data;
    for(let rubro of rubros){
        const option = document.createElement('option');
        option.innerHTML = rubro.numero + "-" + rubro.rubro;
        option.value = rubro.rubro;
        select.appendChild(option);
    };
    traerProductos(select.value,mes);
});


const volver = document.querySelector('.volver');

const traerProductos = async(rubro,mes)=>{
    tbody.innerHTML = ""; //LIMPIAMOS EL TBODY

    let totalMovimientos = 0; //ES UN TOTAL PARA  MOSTRAR EN LA PANTALLA

    let [a,m,d] = hasta.value.split('-');

    d=parseFloat(d)+1;
    d = d<10 ? `0${d}` : d;

    let movimiento;
    if (mes) {
        const mMasUno = parseInt(m)<10 ? `0${parseInt(m)}` : parseInt(m);
        const mMasDos = parseInt(mMasUno)<10 ? `0${parseInt(mMasUno) + 1}` :parseInt(mMasUno) + 1;
        const fechaDesde = `${a}-${mMasUno}-01`;
        const fechaHasta = `${mMasDos === 13 ? parseFloat(a)+1 : a}-${mMasDos === 13 ? "01" : mMasDos}-01`;
        movimiento = (await axios.get(`${URL}movimiento/rubro/${rubro}/${fechaDesde}/${fechaHasta}`)).data;
    }else{
        movimiento = (await axios.get(`${URL}movimiento/rubro/${rubro}/${desde.value}/${a}-${m}-${d}`)).data;
    } 
    for(let mov of movimiento){
        const fecha = new Date(mov.fecha);
        let dia = fecha.getDate();
        let mes = fecha.getMonth() + 1;
        let anio = fecha.getFullYear();
        let hora = fecha.getHours();
        let min = fecha.getMinutes();
        let seg =  fecha.getSeconds();

        dia = dia<10 ? `0${dia}` : dia;
        mes = mes === 13 ? 1 : mes;
        mes = mes<10 ? `0${mes}` : mes;

        hora = hora<10 ? `0${hora}` : hora;
        min = min<10 ? `0${min}` : min;
        seg = seg<10 ? `0${seg}` : seg;

        const tr = document.createElement('tr');

        const tdNumero = document.createElement('td');
        const tdFecha = document.createElement('td');
        const tdCliente = document.createElement('td');
        const tdCodigo = document.createElement('td');
        const tdProducto = document.createElement('td');
        const tdCantidad = document.createElement('td');
        const tdPrecio = document.createElement('td');
        const tdTotal = document.createElement('td');
        const tdMarca = document.createElement('td');

        tdNumero.innerHTML = mov.nro_venta;
        tdFecha.innerHTML = `${dia}/${mes}/${anio}`;
        tdCliente.innerHTML =  mov.cliente;
        tdCodigo.innerHTML = mov.codProd;
        tdProducto.innerHTML = mov.producto;
        tdCantidad.innerHTML = mov.cantidad;
        tdPrecio.innerHTML = mov.precio.toFixed(2);
        tdTotal.innerHTML = (mov.precio * mov.cantidad).toFixed(2);
        tdMarca.innerHTML = mov.marca;

        tr.appendChild(tdNumero);
        tr.appendChild(tdFecha);
        tr.appendChild(tdCliente);
        tr.appendChild(tdCodigo);
        tr.appendChild(tdProducto);
        tr.appendChild(tdCantidad);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdTotal);
        tr.appendChild(tdMarca);

        tbody.appendChild(tr);

        totalMovimientos += mov.cantidad * mov.precio;//sumamos el total del movimiento al total para despues mostrarlo
    };

    total.value = totalMovimientos.toFixed(2);
};

hasta.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        traerProductos(select.value);
    };
});

desde.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        traerProductos(select.value);
    };
})

esteMes.addEventListener('click',e=>{
    traerProductos(select.value,"Mes")
})

select.addEventListener('click',e=>{
    traerProductos(select.value)
})

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        location.href = "../menu.html";
    }
});

volver.addEventListener('click',e=>{
    location.href = "../menu.html";
});


