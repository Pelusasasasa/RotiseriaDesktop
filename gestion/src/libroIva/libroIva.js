const axios = require('axios');
require('dotenv').config();
const URL = process.env.GESTIONURL;

const desde = document.getElementById('desde');
const hasta = document.getElementById('hasta');

const tbody = document.querySelector('tbody');

const salir = document.getElementById('salir');

let ventas;
let presupuestos;

window.addEventListener('load',e=>{
    const date = (new Date()).toISOString().slice(0,10);
    desde.value = date;
    hasta.value = date;
});

desde.addEventListener('keypress',async e=>{
    if (e.keyCode === 13) {
        hasta.focus()
        ventas = (await axios.get(`${URL}ventas/porFecha/${desde.value}/${hasta.value}`)).data;
        presupuestos = (await axios.get(`${URL}presupuesto/betweenDate/${desde.value}/${hasta.value}`)).data;
        listar([...ventas,...presupuestos]);
    }
});

hasta.addEventListener('keypress',async e=>{
    if (e.keyCode === 13) {
        ventas = (await axios.get(`${URL}ventas/porFecha/${desde.value}/${hasta.value}`)).data;
        presupuestos = (await axios.get(`${URL}presupuesto/betweenDate/${desde.value}/${hasta.value}`)).data;
        listar([...ventas,...presupuestos]);
    }
});

const listar = async(ventas)=>{
    console.log(ventas)
    ventas.sort((a,b)=>{
        if (a.fecha > b.fecha) {
            return 1;
        }else if(a.fecha < b.fecha){
            return -1;
        };
        return 0
    });

    tbody.innerHTML = "";
    let dia = ventas[0].fecha.slice(0,10).split('-',3)[2];
    let totalGravado21 = 0;
    let totalGravado105 = 0;
    let totalIva21 = 0;
    let totalIva105 = 0;
    let total = 0;
    let totalNotaCredito = 0;
    let totalFacturas = 0;
    let totalGravado21Nota = 0;
    let totalIva21Nota = 0;
    let totalGravado105Nota = 0;
    let totalIva105Nota = 0;
    let totalGravado21Fact = 0;
    let totalIva21Fact = 0;
    let totalGravado105Fact = 0;
    let totalIva105Fact = 0;
    

    for await(let venta of ventas){

        const tr = document.createElement('tr');

        const tdFecha = document.createElement('td');
        const tdCliente = document.createElement('td');
        const tdCondIva = document.createElement('td');
        const tdCuit = document.createElement('td');
        const tdTipo = document.createElement('td');
        const tdNumero = document.createElement('td');
        const tdGravado21 = document.createElement('td');
        const tdIva21 = document.createElement('td');
        const tdGravado105 = document.createElement('td');
        const tdIva105 = document.createElement('td');
        const tdTotal = document.createElement('td');

        totalGravado21 += (venta.tipo_comp === "Nota Credito B" || venta.tipo_comp === "Nota Credito A" ) ? venta.gravado21 * -1 : venta.gravado21;
        totalGravado105 += (venta.tipo_comp === "Nota Credito B" || venta.tipo_comp === "Nota Credito A" ) ? venta.gravado105 * -1 : venta.gravado105;
        totalIva21 += (venta.tipo_comp === "Nota Credito B" || venta.tipo_comp === "Nota Credito A" ) ? venta.iva21 * -1 : venta.iva21;
        totalIva105 += (venta.tipo_comp === "Nota Credito B" || venta.tipo_comp === "Nota Credito A" ) ? venta.iva105 * -1 : venta.iva105;
        total += (venta.tipo_comp === "Nota Credito B" || venta.tipo_comp === "Nota Credito A" ) ? venta.precio * -1 : venta.precio;
        if (venta.tipo_comp === "Nota Credito B" || venta.tipo_comp === "Nota Credito A") {
            totalNotaCredito += venta.precio;
            totalGravado21Nota += venta.gravado21;
            totalIva21Nota += venta.iva21;
            totalGravado105Nota += venta.gravado105;
            totalIva105Nota += venta.iva105;
        }else{
            totalFacturas += venta.precio;
            totalGravado21Fact += venta.gravado21;
            totalIva21Fact += venta.iva21;
            totalGravado105Fact += venta.gravado105;
            totalIva105Fact += venta.iva105;
        }
        const fecha = venta.fecha.slice(0,10).split('-',3);
        tdFecha.innerHTML = `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
        tdCliente.innerHTML = venta.cliente.slice(0,20);
        tdCondIva.innerHTML = venta.condicionIva;
        tdCuit.innerHTML = venta.num_doc;
        tdTipo.innerHTML = venta.tipo_comp;
        tdNumero.innerHTML = venta.afip.puntoVenta.padStart(4,'0') + "-" + venta.afip.numero.toString().padStart(8,'0');
        tdGravado21.innerHTML = (venta.tipo_comp === "Nota Credito A" || venta.tipo_comp === "Nota Credito B") ? (venta.gravado21 * -1).toFixed(2) : venta.gravado21.toFixed(2);
        tdGravado105.innerHTML = (venta.tipo_comp === "Nota Credito A" || venta.tipo_comp === "Nota Credito B") ? (venta.gravado105 * -1).toFixed(2) : venta.gravado105.toFixed(2);
        tdIva21.innerHTML = (venta.tipo_comp === "Nota Credito A" || venta.tipo_comp === "Nota Credito B") ? (venta.iva21 * -1).toFixed(2) : venta.iva21.toFixed(2);
        tdIva105.innerHTML = (venta.tipo_comp === "Nota Credito A" || venta.tipo_comp === "Nota Credito B") ? (venta.iva105 * -1).toFixed(2) : venta.iva105.toFixed(2);
        tdTotal.innerHTML = (venta.tipo_comp === "Nota Credito A" || venta.tipo_comp === "Nota Credito B") ? (venta.precio * -1).toFixed(2) : venta.precio.toFixed(2);

        tdGravado21.classList.add('text-rigth');
        tdGravado105.classList.add('text-rigth');
        tdIva21.classList.add('text-rigth');
        tdIva105.classList.add('text-rigth');
        tdTotal.classList.add('text-rigth');

        tr.appendChild(tdFecha);
        tr.appendChild(tdCliente);
        tr.appendChild(tdCondIva);
        tr.appendChild(tdCuit);
        tr.appendChild(tdTipo);
        tr.appendChild(tdNumero);
        tr.appendChild(tdGravado21);
        tr.appendChild(tdIva21);
        tr.appendChild(tdGravado105);
        tr.appendChild(tdIva105);
        tr.appendChild(tdTotal);
        
        tbody.appendChild(tr);

    };
    const tr = document.createElement('tr');
    const tr2 = document.createElement('tr');
    const tr3 = document.createElement('tr');

    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const td3 = document.createElement('td');
    const td4 = document.createElement('td');
    const td5 = document.createElement('td');
    const tdTexto = document.createElement('td');

    const td6 = document.createElement('td');
    const td7 = document.createElement('td');
    const td8 = document.createElement('td');
    const td9 = document.createElement('td');
    const td10 = document.createElement('td');
    const tdTexto1 = document.createElement('td');

    const td11 = document.createElement('td');
    const td12 = document.createElement('td');
    const td13 = document.createElement('td');
    const td14 = document.createElement('td');
    const td15 = document.createElement('td');
    const tdTexto2 = document.createElement('td');

    const tdTotalGravado21Nota = document.createElement('td');
    const tdTotalGravado105Nota = document.createElement('td');
    const tdTotalIva21Nota = document.createElement('td');
    const tdTotalIva105Nota = document.createElement('td');
    const tdTotalNotaCredito = document.createElement('td');

    const tdTotalGravado21Fact = document.createElement('td');
    const tdTotalGravado105Fact = document.createElement('td');
    const tdTotalIva21Fact = document.createElement('td');
    const tdTotalIva105Fact = document.createElement('td');
    const tdTotalFact = document.createElement('td');

    const tdTotalGravado21 = document.createElement('td');
    const tdTotalGravado105 = document.createElement('td');
    const tdTotalIva21 = document.createElement('td');
    const tdTotalIva105 = document.createElement('td');
    const tdTotal = document.createElement('td');


    tdTexto.innerHTML = "Totales Nota De Credito";
    tdTotalGravado21Nota.innerHTML = totalGravado21Nota.toFixed(2);
    tdTotalGravado105Nota.innerHTML = totalGravado105Nota.toFixed(2);
    tdTotalIva21Nota.innerHTML = totalIva21Nota.toFixed(2);
    tdTotalIva105Nota.innerHTML = totalIva105Nota.toFixed(2);
    tdTotalNotaCredito.innerHTML = totalNotaCredito.toFixed(2);

    tdTexto1.innerHTML = "Totales Facturas"
    tdTotalGravado21Fact.innerHTML = totalGravado21.toFixed(2);
    tdTotalGravado105Fact.innerHTML =  totalGravado105Fact.toFixed(2);
    tdTotalIva21Fact.innerHTML =  totalIva21Fact.toFixed(2);
    tdTotalIva105Fact.innerHTML =  totalIva105Fact.toFixed(2);
    tdTotalFact.innerHTML =  totalFacturas.toFixed(2);

    tdTexto2.innerHTML = "Totales Mensual"
    tdTotalGravado21.innerHTML = totalGravado21.toFixed(2);
    tdTotalGravado105.innerHTML =  totalGravado105.toFixed(2);
    tdTotalIva21.innerHTML =  totalIva21.toFixed(2);
    tdTotalIva105.innerHTML =  totalIva105.toFixed(2);
    tdTotal.innerHTML =  total.toFixed(2);

    tdTotalGravado21Nota.classList.add('text-rigth');
    tdTotalGravado105Nota.classList.add('text-rigth');
    tdTotalIva21Nota.classList.add('text-rigth');
    tdTotalIva105Nota.classList.add('text-rigth');
    tdTotalNotaCredito.classList.add('text-rigth');

    tdTotalGravado21Fact.classList.add('text-rigth');
    tdTotalGravado105Fact.classList.add('text-rigth');
    tdTotalIva21Fact.classList.add('text-rigth');
    tdTotalIva105Fact.classList.add('text-rigth');
    tdTotalFact.classList.add('text-rigth');

    tdTotalGravado21.classList.add('text-rigth');
    tdTotalGravado105.classList.add('text-rigth');
    tdTotalIva21.classList.add('text-rigth');
    tdTotalIva105.classList.add('text-rigth');
    tdTotal.classList.add('text-rigth');

    tdTotalGravado21Nota.classList.add('text-bold');
    tdTotalGravado105Nota.classList.add('text-bold');
    tdTotalIva21Nota.classList.add('text-bold');
    tdTotalIva105Nota.classList.add('text-bold');
    tdTotalNotaCredito.classList.add('text-bold');

    tdTotalGravado21Fact.classList.add('text-bold');
    tdTotalGravado105Fact.classList.add('text-bold');
    tdTotalIva21Fact.classList.add('text-bold');
    tdTotalIva105Fact.classList.add('text-bold');
    tdTotalFact.classList.add('text-bold');

    tdTotalGravado21.classList.add('text-bold');
    tdTotalGravado105.classList.add('text-bold');
    tdTotalIva21.classList.add('text-bold');
    tdTotalIva105.classList.add('text-bold');
    tdTotal.classList.add('text-bold');

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(tdTexto);
    tr.appendChild(tdTotalGravado21Nota);
    tr.appendChild(tdTotalGravado105Nota);
    tr.appendChild(tdTotalIva21Nota);
    tr.appendChild(tdTotalIva105Nota);
    tr.appendChild(tdTotalNotaCredito);


    tr2.appendChild(td6);
    tr2.appendChild(td7);
    tr2.appendChild(td8);
    tr2.appendChild(td9);
    tr2.appendChild(td10);
    tr2.appendChild(tdTexto1);
    tr2.appendChild(tdTotalGravado21Fact);
    tr2.appendChild(tdTotalIva21Fact);
    tr2.appendChild(tdTotalGravado105Fact);
    tr2.appendChild(tdTotalIva105Fact);
    tr2.appendChild(tdTotalFact);

    tr3.appendChild(td11);
    tr3.appendChild(td12);
    tr3.appendChild(td13);
    tr3.appendChild(td14);
    tr3.appendChild(td15);
    tr3.appendChild(tdTexto2);
    tr3.appendChild(tdTotalGravado21);
    tr3.appendChild(tdTotalIva21);
    tr3.appendChild(tdTotalGravado105);
    tr3.appendChild(tdTotalIva105);
    tr3.appendChild(tdTotal);

    tbody.appendChild(tr);
    tbody.appendChild(tr2);
    tbody.appendChild(tr3);

};

salir.addEventListener('click',e=>{
    location.href = '../menu.html';
});

document.addEventListener('keyup',e=>{
    if(e.keyCode === 27){
        location.href = '../menu.html';
    }
})