function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

//parte de la configuracion
let vendedor = getParameterByName('vendedor');
const archivo = require('../configuracion.json');

const axios = require('axios');
require("dotenv").config();
const URL = process.env.GESTIONURL;

const { ipcRenderer } = require('electron');
const {apretarEnter, cargarFactura, redondear} = require('../helpers');
const sweet = require('sweetalert2');

const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const saldo = document.querySelector('#saldo');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const fecha = document.querySelector('#fecha');
const cancelar = document.querySelector('.cancelar');
const tbody = document.querySelector('tbody');
const total = document.querySelector('#total');
const imprimir = document.querySelector('.imprimir');
const entregado = document.querySelector('#entregado');
const tarjeta = document.querySelector('#tarjeta');

let cuentaAFavor

const hoy = new Date();
let d = hoy.getDate();
let m = hoy.getMonth() + 1;
let a = hoy.getFullYear();

d = d<10 ? `0${d}` : d;
m = m<10 ? `0${m}` : m;
m = m===13 ? 1 : m;

fecha.value = `${a}-${m}-${d}`

ipcRenderer.on('recibir',(e,args)=>{
    const {informacion} = JSON.parse(args);
    ponerInputs(informacion);
});



//Pnemos los valores del cliente traido
const ponerInputs = async(id)=>{
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    if (cliente !== "") {
        codigo.value = cliente._id;
        nombre.value = cliente.nombre;
        saldo.value = (cliente.saldo).toFixed(2);
        localidad.value = cliente.localidad;
        direccion.value = cliente.direccion;
        const compensadas = (await axios.get(`${URL}compensada/traerCompensadas/${cliente._id}`)).data;
        tbody.innerHTML = "";
        compensadas.forEach(compensada => {
            ponerVenta(compensada);
        });
    }else{
        await sweet.fire("Cliente no encontrado");
        codigo.value = "";
        nombre.value = "";
        saldo.value = "";
        localidad.value = "";
        direccion.value = "";
        tbody.innerHTML = "";
    }
}

//Ponemos las cuentas compensadas de los clientes
const ponerVenta = async(cuenta)=>{
    const hoy = new Date(cuenta.fecha);
    let dia = hoy.getDate();
    let mes = hoy.getMonth() + 1;
    let anio = hoy.getFullYear();

    dia = dia<10 ? `0${dia}` : dia;
    mes = mes<10 ? `0${mes}` : mes;
    mes = mes === 13 ? 1 : mes;

    const tr = document.createElement('tr');
    tr.classList.add(`${cuenta.nro_venta}`);

    const tdFecha = document.createElement('td');
    const tdNumero = document.createElement('td');
    const tdImporte = document.createElement('td');
    const tdTipoComp = document.createElement('td');
    const tdPagado = document.createElement('td');
    const tdActual = document.createElement('td');
    const inputActual = document.createElement('input');
    const tdSaldo = document.createElement('td');

    tdFecha.innerHTML = `${dia}/${mes}/${anio}`;
    tdNumero.innerHTML = cuenta.nro_venta;
    tdTipoComp.innerHTML = cuenta.tipo_comp;
    tdImporte.innerHTML = cuenta.tipo_comp === "Nota Credito C" ? redondear(cuenta.importe * -1, 2) : redondear(cuenta.importe,2) ;
    tdPagado.innerHTML = redondear(cuenta.pagado,2);
    tdSaldo.innerHTML = cuenta.tipo_comp === "Nota Credito C" ? redondear(cuenta.saldo * -1,2) : redondear(cuenta.saldo,2);
    inputActual.value = "0.00";
    inputActual.type = "number"
    inputActual.id = cuenta.nro_venta;
    tdActual.appendChild(inputActual)

    tr.appendChild(tdFecha);    
    tr.appendChild(tdNumero);
    tr.appendChild(tdTipoComp);    
    tr.appendChild(tdImporte);
    tr.appendChild(tdPagado);
    tr.appendChild(tdActual);
    tr.appendChild(tdSaldo);

    tbody.appendChild(tr);
}

//Cuando hago un click que seleccione el input
let inputSeleccionado = tbody;
let trSeleccionado = "";
tbody.addEventListener('click',e=>{
    const seleccion = e.target;
    if (seleccion.nodeName === "INPUT") {
        inputSeleccionado = seleccion;
    }else if(seleccion.nodeName === "TD"){
        inputSeleccionado = seleccion.parentNode.children[5].children[0];
        inputSeleccionado.focus();
    }else if(seleccion.nodeName === "TR"){
        inputSeleccionado = seleccion.children[5].children[0];
        inputSeleccionado.focus();
    }
    trSeleccionado = inputSeleccionado.parentNode.parentNode;
    inputSeleccionado.select();
});

//cuando cambiamos el valor del input, tambien cambiamos el valor de las demas columnas y el total del recibo

inputSeleccionado.addEventListener('change',e=>{
        total.value = parseFloat(total.value) -  (parseFloat(trSeleccionado.children[3].innerHTML) - parseFloat(trSeleccionado.children[4].innerHTML) - parseFloat(trSeleccionado.children[6].innerHTML));
        trSeleccionado.children[6].innerHTML = (parseFloat(trSeleccionado.children[3].innerHTML) - parseFloat(trSeleccionado.children[4].innerHTML) - parseFloat(inputSeleccionado.value)).toFixed(2);
        total.value = redondear(parseFloat(total.value) + parseFloat(inputSeleccionado.value),2);
        if (trSeleccionado.nextElementSibling) {
            trSeleccionado = trSeleccionado.nextElementSibling;
            inputSeleccionado = trSeleccionado.children[5].children[0];
            inputSeleccionado.focus();                  
            inputSeleccionado.select();
        };

        //para sacar el disabled del saldo a favor
        if (parseFloat(total.value) === parseFloat(saldo.value)) {
            entregado.removeAttribute('disabled');
        }   
});


entregado.addEventListener('change',async e=>{
    const trs = document.querySelectorAll('tbody tr');
    if ( (entregado.value !== "" && parseFloat(entregado.value) !== 0)) {
        let saldo = parseFloat(entregado.value);
        for await(let tr of trs){
            const hijo = tr.children;
            if (saldo !== 0) {
                if (saldo >= parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].innerHTML)) {
                    hijo[5].children[0].value = redondear(parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].innerHTML),2)
                    hijo[6].innerHTML = redondear(parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].innerHTML) - parseFloat(hijo[5].children[0].value),2)
                    saldo = parseFloat(redondear((saldo - parseFloat(hijo[5].children[0].value)).toFixed(2),2));
                }else{
                    hijo[5].children[0].value = saldo;
                    hijo[6].innerHTML = redondear(parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].innerHTML) - parseFloat(hijo[5].children[0].value),2)
                    saldo = 0;
                }
            }else{
                hijo[5].children[0].value = saldo;
                hijo[6].innerHTML = redondear(parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].innerHTML) - parseFloat(hijo[5].children[0].value),2)
            };
        }
        if (saldo>0) {
            //si queda saldo por descontar , creamos una compensada para que quede el saldo a favor  tambien un historica
            cuentaAFavor = await crearCompensadaAFavor(saldo)
        }else{
            cuentaAFavor = cuentaAFavor &&  null;
        }
        total.value = entregado.value;
    }else if( (parseFloat(entregado.value) === 0 || entregado.value === "")){
        for await(let tr of trs){
            const hijo = tr.children;
            hijo[5].children[0].value = 0;
            hijo[6].innerHTML = (parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].innerHTML)).toFixed(2);
        };
        total.value = entregado.value;
    }
})

imprimir.addEventListener('click',async e=>{
    const recibo = {};
    recibo.fecha = new Date();
    recibo.cliente = nombre.value;
    recibo.idCliente = codigo.value;
    recibo.numero = (await axios.get(`${URL}numero`)).data["Recibo"] + 1; //ponemos el numero traido mas 1|
    recibo.tipo_comp = "Recibo";
    recibo.descuento = 0;
    recibo.precio = parseFloat(total.value);
    recibo.vendedor = vendedor ? vendedor : "";
    recibo.caja = archivo.caja;
    try{
        if (tarjeta.checked) {
            recibo.cod_comp = 11;
            recibo.num_doc = 00000000;
            recibo.cod_doc = 99;
            recibo.tipo_venta = "T";
            await cargarFactura(recibo)
        }
        cuentaAFavor && await crearCuentaCompensada(cuentaAFavor)
        await modificarCuentaCompensadas();
        await ponerEnCuentaHistorica(recibo);
        await descontarSaldoCliente(recibo.idCliente,recibo.precio);
        await axios.post(`${URL}recibo`,recibo);
        //Lo usamos paara imprimir
        const lista = [];
        const trs = document.querySelectorAll('tbody tr');
        for await(let tr of trs){
            if (parseFloat(tr.children[5].children[0].value) !== 0 && tr.children[5].children[0].value !== "") {
                const venta = {};
                venta.fecha = tr.children[0].innerHTML;
                venta.comprobante = tr.children[1].innerHTML;
                venta.pagado = parseFloat(tr.children[4].innerHTML) + parseFloat(tr.children[5].children[0].value)
                lista.push(venta);   
            }
        };

        await axios.put(`${URL}numero/Recibo`,{Recibo:recibo.numero});
        const cliente = (await axios.get(`${URL}clientes/id/${codigo.value}`)).data;
        ipcRenderer.send('imprimir',[recibo,cliente,lista])
        location.href = "../menu.html";
    }catch(error){
        console.log(error)
        await sweet.fire({
            title:"No se pudo generar la venta"
        })
    }
});

//Le descontamos un saldo al cliente
const descontarSaldoCliente =async(idCliente,precio)=>{
    const cliente = (await axios.get(`${URL}clientes/id/${idCliente}`)).data;
    cliente.saldo = (cliente.saldo - precio).toFixed(2);
    await axios.put(`${URL}clientes/id/${idCliente}`,cliente);
};

//Todas las compensadas que se modificaron las modificamos
const modificarCuentaCompensadas = async()=>{
    const trs = document.querySelectorAll('tbody tr');
    for await(let tr of trs){
        const numero = parseFloat(tr.children[5].children[0].value) !== 0 ? tr.children[1].innerHTML : "";
        const compensada =  numero !== "" ? (await axios.get(`${URL}compensada/traerCompensada/id/${numero}`)).data : "";
        console.log(compensada)
        if (compensada !== "") {
            compensada.pagado = parseFloat((compensada.pagado + parseFloat(tr.children[5].children[0].value)).toFixed(2));
            compensada.saldo = parseFloat(tr.children[6].innerHTML).toFixed(2);
            await axios.put(`${URL}compensada/traerCompensada/id/${compensada.nro_venta}`,compensada);
        }
    }
};

//Ponemos en historica el recibo
const ponerEnCuentaHistorica = async(recibo)=>{
    const cuenta = {};
    cuenta.idCliente = recibo.idCliente;
    cuenta.cliente = recibo.cliente;
    cuenta.nro_venta = recibo.numero;
    cuenta.haber = recibo.precio;
    cuenta.tipo_comp = "Recibo";
    const cliente = (await axios.get(`${URL}clientes/id/${recibo.idCliente}`)).data;
    cuenta.saldo = (cliente.saldo - recibo.precio).toFixed(2);
    await axios.post(`${URL}historica`,cuenta);
};


const crearCompensadaAFavor = async (saldo)=>{
    const compensada = {};
    compensada.idCliente = codigo.value;
    compensada.cliente = nombre.value;
    compensada.tipo_comp = "Recibo";
    compensada.importe = -1*saldo;
    compensada.pagado = 0;
    compensada.saldo = -1*saldo;
    return compensada;
}
//creamos una compensda para cuando se haga el recibo y quede saldo a favor
const crearCuentaCompensada = async(cuenta)=>{
    const numero = (await axios.get(`${URL}numero`)).data["Cuenta Corriente"];
    cuenta.nro_venta = numero + 1;
    try {
        await axios.post(`${URL}compensada`,cuenta)
        await axios.put(`${URL}numero/Cuenta Corriente`,{"Cuenta Corriente":numero + 1});
    } catch (error) {
        console.log(error)
        sweet.fire({
            title:"No se puede generar la venta"
        })
    }
}


entregado.addEventListener('focus',e=>{
    entregado.select();
});


nombre.addEventListener('keypress',e=>{
    apretarEnter(e,localidad)
});

localidad.addEventListener('keypress',e=>{
    apretarEnter(e,direccion)
});

direccion.addEventListener('keypress',e=>{
    apretarEnter(e,fecha);
});

fecha.addEventListener('keypress',e=>{
    apretarEnter(e,localidad)
});

cancelar.addEventListener('click',e=>{
    location.href = "../menu.html";
})

//si apretramos enter y el valor es vacio abrimos para buscar los clientes
codigo.addEventListener('keypress', async e=>{
    if (e.key === "Enter") {
        if (codigo.value != "") {
            ponerInputs(codigo.value)
        }else{
            const options = {
                path:"./clientes/clientes.html",
                botones:false,
            }
            ipcRenderer.send('abrir-ventana',options);
        }
    }
});
