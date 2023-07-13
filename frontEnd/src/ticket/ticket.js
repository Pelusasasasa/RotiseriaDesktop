const {ipcRenderer} = require('electron')

const tipoComp = document.querySelector('.tipoComp');
const numeroComp = document.querySelector('.numeroComp');
const fecha = document.querySelector('.fecha');
const hora = document.querySelector('.hora');
const pedido = document.querySelector('.pedido');

//cliente
const cliente = document.querySelector('.cliente');
const direccion = document.querySelector('.direccion');
const cuit = document.querySelector('.cuit');
const telefono = document.querySelector('.telefono');
const notaCredito = document.querySelector('.notaCredito');

//listado
const listado = document.querySelector('.listado');

//totales
const descuento = document.querySelector('.descuento');
const total = document.querySelector('.total');
const tipoVenta = document.querySelector('.tipoVenta');
const descuentoPorDocena = document.querySelector('.descuentoPorDocena');

//afip
const qr = document.querySelector('#qr');
const cae = document.querySelector('#cae');
const vencimientoCae = document.querySelector('#vencimientoCae');

//En caso de recibo
const cantidadPrecio = document.querySelector('.cantidadPrecio');
const iva = document.querySelector('.iva');
const pagado = document.querySelector('.pagado');
const descripcion = document.querySelector('.descripcion');


const datos = document.querySelector('.datos');
const titulo = document.querySelector('.titulo');

ipcRenderer.on('imprimir',(e,args)=>{
    const [venta,cliente,listado] = JSON.parse(args);
    listar(venta,cliente,listado);
    if(!venta.F){
        titulo.classList.remove('none');
        datos.classList.add('none');
    }
});

const listar = async(venta,clienteTraido,lista)=>{
    let date = new Date(venta.fecha);
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
    pedido.innerText = venta.nPedido;
    numeroComp.innerHTML = venta.F ? (venta.afip.puntoVenta.toString()).padStart(4,'0') + "-" + venta.afip.numero.toString().padStart(8,'0') :(venta.numero.toString()).padStart(8,'0');
    tipoComp.innerHTML = venta.tipo_comp;
    fecha.innerHTML = `${day}/${month}/${year}`;
    hora.innerHTML = `${hour}:${minuts}:${seconds}`;
    cliente.innerHTML = venta.cliente;
    telefono.innerText = "Telefono: " + clienteTraido.telefono
    direccion.innerHTML = "Direccion: " + clienteTraido.direccion;
    cuit.innerHTML = clienteTraido.cuit.length > 8 ? `CUIT: ${clienteTraido.cuit}` : `DNI: ${clienteTraido.cuit}`;
    notaCredito.innerHTML = venta.tipo_comp === "Nota Credito C" ? `Numero de Factura: 0002-${venta.facturaAnterior}` : "";

    if (venta.tipo_comp === "Recibo") {
        cantidadPrecio.innerHTML = "Fecha";
        iva.innerHTML = "Comprobante";
        pagado.innerHTML = "Pagado";
        descripcion.classList.add('none');
        notaCredito.innerHTML = `SALDO ACTUAL: ${clienteTraido.saldo}`;
    }
    for await(const elem of lista){
        console.log(elem)
        if (venta.tipo_comp !== "Recibo") {
            listado.innerHTML += `
                <main>
                    <p>${elem.producto}</p>
                    <p>$ ${(elem.precio * elem.cantidad).toFixed(2)}</p>
                </main>
                <main class = "linea">
                    <p>${elem.cantidad.toFixed(2)}/${elem.precio.toFixed(2)}</p>
                    <p></p>
                </main>
                <main class = "observaciones">
                    <p>${elem.observaciones ? elem.observaciones : ""}</p>
                </main>
                <p>------------------------------------</p>
            `   
        }else{
            listado.innerHTML += `
                <main>
                    <p>${elem.fecha}</p>
                    <p>${elem.comprobante.toString().padStart(8,'0')}</p>
                    <p>${elem.pagado.toFixed(2)}</p>
                </main>
            `
        }
    };

    descuento.innerHTML = "0.00"
    total.innerHTML = venta.precio.toFixed(2);
    tipoVenta.innerHTML = venta.tipo_venta === "CC" ? "Cuenta Corriente" : "Contado";
    descuentoPorDocena.innerText = venta.descuentoPorDocena ? "Se hizo descuento por docena de Empanadas" : "";

    if (venta.F) {
        vencimientoCae.innerHTML = `Vencimiento Cae: ${venta.afip.vencimiento}`;
        cae.innerHTML = `CAE: ${venta.afip.cae}`;
        qr.src = venta.afip.QR;

    }
    ipcRenderer.send('imprimir-ventana');
}