const { ipcRenderer } = require("electron");
const {puntoVenta} = require('../configuracion.json')


//informacion ticket
const tipoComp = document.getElementById('tipoComp');
const numeroComp = document.getElementById('numeroComp');
const fecha = document.getElementById('fecha');
const hora = document.getElementById('hora');
const pedido = document.getElementById('pedido');

//cliente
const cliente = document.getElementById('cliente');
const cuit = document.getElementById('cuit');
const direccion = document.getElementById('direccion');
const telefono = document.getElementById('telefono');
const notaCredito = document.getElementById('notaCredito');

//lista de productos
const productos = document.querySelector('.productos');

//Total
const total = document.getElementById('total');
const descuentoPorDocena = document.querySelector('.descuentoPorDocena');
 
ipcRenderer.on('imprimir',async(e,args)=>{
    const [venta,cliente,listado] = JSON.parse(args);
    await listarInfoTicket(venta);
    await listarInfoCliente(cliente,venta.tipo_comp,venta.facturaAnterior);
    await listarProductos(listado);
    ipcRenderer.send('imprimir-ventana');
});

function listarInfoTicket (info) {
    let date = new Date(info.fecha);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minuts = date.getMinutes();
    let seconds = date.getSeconds();
    month = month === 13 ? 1 : month;
    month = month <10 ? `0${month}` : month;
    day = day <10 ? `0${day}` : day;
    hour = hour <10 ? `0${hour}` : hour;
    minuts = minuts <10 ? `0${minuts}` : minuts;
    seconds = seconds <10 ? `0${seconds}` : seconds;
    tipoComp.innerText = info.tipo_comp;
    numeroComp.innerText = info.numero.toString().padStart(8,'0');
    fecha.innerText = `${day}/${month}/${year}`;
    hora.innerText = `${hour}:${minuts}:${seconds}`;
    pedido.innerText = info.nPedido;
    total.innerText = info.precio;
    descuentoPorDocena.innerText = info.descuentoPorDocena ? "Se hizo descuento por docena de Empanadas" : ""
};

function listarInfoCliente(info,tipo) {
    cliente.innerText = "CLIENTE: " + info.nombre;
    if (info.cuit !== "") {
        cuit.innerText = info.cuit.length === 8 ? "DNI: " + info.cuit : "CUIT: " + info.cuit;
    };
    if (info.direccion !== "") {
        direccion.innerText = "DIRECCION: " + info.direccion;
    };
    if(info.telefono !== ""){
        telefono.innerText = "TELEFONO: " + info.telefono
    };
    if (tipo === "Nota Credito C"){
        notaCredito.innerText = `Numero de Factura: ${puntoVenta.startsWith('0',4)}-${info.facturaAnterior.startsWith('0',8)}`;
    }
}

function listarProductos(lista) {
    for(let {cantidad,producto,precio,observaciones} of lista){
        const h3 = document.createElement('h1');
        const pObservaciones = document.createElement('p');
        const p = document.createElement('p');

        pObservaciones.classList.add('text-big');//Ponemos para que las observaciones se vean grande
        //Las agregamos al innerText
        h3.innerText = `${cantidad} - ${producto} - $${precio.toFixed(2)}`;
        pObservaciones.innerText = observaciones ? `${observaciones}` : "";
        p.innerText = "---------------------------------------------------------------";
        //Las Agremgamos al ticket
        productos.appendChild(h3);
        productos.appendChild(pObservaciones);
        productos.appendChild(p);
    }
}