function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let vendedor = getParameterByName('vendedor');

const { ipcRenderer } = require("electron");
const { cerrarVentana, redondear, agregarMovimientoVendedores } = require("../helpers");
const sweet = require('sweetalert2');
const { default: Swal } = require("sweetalert2");

let seleccionado;
let subSeleccionado;

const tarjeta = document.querySelector('.tarjeta');
const contado = document.querySelector('.contado');

const botonDia = document.querySelector('.botonDia');
const botonMes = document.querySelector('.botonMes');
const botonAnio = document.querySelector('.botonAnio');

const dia = document.querySelector('.dia');
const mes = document.querySelector('.mes');
const anio = document.querySelector('.anio');

let botonSeleccionado = document.querySelector('.seleccionado');

const fecha = document.querySelector('#fecha');
const selectMes = document.querySelector('#mes');
const inputAnio = document.querySelector('#anio');

const tbody = document.querySelector('.tbodyListado');
const tbodyGastos = document.querySelector('.tbodyGastos');
const volver = document.querySelector('.volver');
const total = document.querySelector('#total');

const pestaña = document.querySelector('.pestaña')

let ventas = [];
let recibos = [];
let gastos = [];
let presupuestos = [];
let cuentasCorrientes = [];
let tipoVenta = "CD";
let filtro = "Ingresos";
const fechaHoy = new Date();
let d = fechaHoy.getDate();
let m = fechaHoy.getMonth() + 1;
let a = fechaHoy.getFullYear(); 

m = m<10 ? `0${m}`: m;
d = d<10 ? `0${d}`: d;

pestaña.addEventListener('click',async e=>{
    if (e.target.parentNode.nodeName === "MAIN") {
        document.querySelector('.pestañaSeleccionada') && document.querySelector('.pestañaSeleccionada').classList.remove('pestañaSeleccionada');
        e.target.parentNode.classList.add('pestañaSeleccionada');
        filtro = e.target.innerHTML;

        if (filtro === "Gastos") {
            document.querySelector('.gastos').classList.remove('none');
            document.querySelector('.listado').classList.add('none');
            //Esconder botones
            tarjeta.classList.add('none');
            contado.classList.add('none');
            let retornar = await verQueTraer();
            listarGastos(retornar);
        }else if(filtro === "Ingresos"){
            document.querySelector('.listado').classList.remove('none');
            document.querySelector('.gastos').classList.add('none');
            //Mostrar botones
            tarjeta.classList.remove('none');
            contado.classList.remove('none');
            let retornar = await verQueTraer();
            tipoVenta = "CD";
            listarVentas(retornar);
        }else if(filtro === "Presupuestos"){
            contado.classList.remove('none');
            tarjeta.classList.add('none');
            let retornar = await verQueTraer();
            tipoVenta = "PP";
            listarVentas(retornar)
        }else{
            document.querySelector('.listado').classList.remove('none');
            document.querySelector('.gastos').classList.add('none');
            //Esconder botones
            tarjeta.classList.add('none');
            contado.classList.add('none');
            tipoVenta = "CC";
            listarVentas(cuentasCorrientes);
        }
    }
});

window.addEventListener('load',async e=>{
    fecha.value = `${a}-${m}-${d}`;
    selectMes.value = m;
    inputAnio.value = a;
    await ipcRenderer.invoke('get-ventas-for-day',fecha.value).then((result)=>{
        ventas = JSON.parse(result);
    });
    listarVentas(ventas);
});

const eliminarVenta = async(e) => {

    const id = e.target.parentNode.parentNode.id;

    const { isConfirmed } = await Swal.fire({
        title: '¿Seguro queres Eliminar La venta?',
        confirmButtonText: 'Aceptar',
        showCancelButton: true
    });

    if(isConfirmed){
        const ventaEliminada = JSON.parse(await ipcRenderer.invoke('delete-venta', id));
        ventas = ventas.filter( elem => elem._id !== ventaEliminada._id);

        const trEliminado = document.getElementById(`${ventaEliminada._id}`);

        //Son los tr que muestran los productos de una venta
        const alltrMovEliminados = document.querySelectorAll(`.venta${ventaEliminada._id}`);

        for(let elem of alltrMovEliminados){
            tbody.removeChild(elem);
        };

        tbody.removeChild(trEliminado);

        console.log(total.value)
        console.log(trEliminado.children[6].innerText)

        total.value = redondear(parseFloat(total.value) - parseFloat(trEliminado.children[6].innerText), 2);
    }
}

const verQueTraer = async()=>{
    if (botonSeleccionado.classList.contains("botonDia")) {
        if (filtro === "Ingresos") {
            ventas = (await axios.get(`${URL}ventas/dia/${fecha.value}`)).data;
            recibos = (await axios.get(`${URL}recibo/dia/${fecha.value}`)).data;
            return([...ventas,...recibos]);
        }else if(filtro === "Presupuestos"){
            presupuestos = (await axios.get(`${URL}presupuesto/forDay/${fecha.value}`)).data;
            return presupuestos
        }else{
            return ((await axios.get(`${URL}gastos/dia/${fecha.value}`)).data);
        }
    }else if(botonSeleccionado.classList.contains("mes")){
        if (filtro === "Ingresos") {
            ventas = (await axios.get(`${URL}ventas/mes/${selectMes.value}`)).data;
            recibos = (await axios.get(`${URL}recibo/mes/${selectMes.value}`)).data;
            return([...ventas,...recibos])
        }else{
            return ((await axios.get(`${URL}gastos/mes/${selectMes.value}`)).data);
        }
    }else{
        if (filtro === "Ingresos") {
            ventas = (await axios.get(`${URL}ventas/anio/${inputAnio.value}`)).data;
            recibos = (await axios.get(`${URL}recibo/anio/${inputAnio.value}`)).data;
            return([...ventas,...recibos])
        }else{
            return ((await axios.get(`${URL}gastos/anio/${inputAnio.value}`)).data)
        }
    }
};

//Cuando se hace click en el boton tarjeta, lo que hacemos es mostrar las ventas con tarjetas
tarjeta.addEventListener('click',e=>{
    if(!tarjeta.classList.contains('buttonSeleccionado')){
        contado.classList.remove('buttonSeleccionado');
        tarjeta.classList.add('buttonSeleccionado');
        tipoVenta = "T";
        listarVentas(ventas)
    };
});

//Cuando hacemos click en contado mostramos las ventas en contado
contado.addEventListener('click',e=>{
    if(!contado.classList.contains('buttonSeleccionado')){
        tarjeta.classList.remove('buttonSeleccionado');
        contado.classList.add('buttonSeleccionado');
        tipoVenta = "CD";
        listarVentas(ventas)
    };
});

//muestra las ventas del dia cuando tocamos en el boton
botonDia.addEventListener('click',async e=>{
    botonSeleccionado.classList.remove('seleccionado');
    botonSeleccionado = botonDia;
    dia.classList.remove('none');
    mes.classList.add('none');
    anio.classList.add('none');
    botonSeleccionado.classList.add('seleccionado');
    if (filtro === "Ingresos" || filtro === "Cuenta Corriente") {
        ventas = JSON.parse(await ipcRenderer.invoke('get-ventas-for-day',fecha.value));
        // recibos = (await axios.get(`${URL}recibo/dia/${fecha.value}`)).data;
        // cuentasCorrientes = ventas.filter(venta=>venta.tipo_venta === "CC");
        if (filtro === "Ingresos") {
            listarVentas([...ventas,...recibos]);
        }else{
            listarVentas(cuentasCorrientes);
        }
    }else if(filtro === "Presupuestos"){
        presupuestos = (await axios.get(`${URL}presupuesto/forDay/${fecha.value}`)).data;
        listarVentas(presupuestos);
    }else{
        gastos = JSON.parse(await ipcRenderer.invoke('get-gastos-for-day',fecha.value));
        listarGastos(gastos);
    }
});

//muestra las ventas del mes cuando tocamos en el boton
botonMes.addEventListener('click',async e=>{
    botonSeleccionado.classList.remove('seleccionado');
    botonSeleccionado = botonMes;
    botonSeleccionado.classList.add('seleccionado');

    mes.classList.remove('none');
    dia.classList.add('none');
    anio.classList.add('none');


    //vemos que tipo de filtro es y ahi vemos si traemos los ingresos o gastos
    if (filtro === "Ingresos"){
        await ipcRenderer.invoke('get-ventas-for-month',selectMes.value).then((result)=>{
            ventas = JSON.parse(result);
        });
        console.log(ventas)
        listarVentas(ventas);
    }else{
        gastos = (await axios.get(`${URL}gastos/mes/${selectMes.value}`)).data;
        listarGastos(gastos);
    }
});

//muestra las ventas del año cuando tocamos en el boton
botonAnio.addEventListener('click',async e=>{
    botonSeleccionado.classList.remove('seleccionado');
    botonSeleccionado = botonAnio;
    anio.classList.remove('none');
    dia.classList.add('none');
    mes.classList.add('none');

    botonSeleccionado.classList.add('seleccionado');
    if (filtro === "Ingresos") {
       await ipcRenderer.invoke('get-ventas-for-year',inputAnio.value).then((result)=>{
        ventas = JSON.parse(result);
       });
       listarVentas(ventas);
    }else{
        gastos = (await axios.get(`${URL}gastos/anio/${inputAnio.value}`)).data;
        listarGastos(gastos);
    }
});

fecha.addEventListener('keypress',async e=>{
    if ((e.key === "Enter")) {
        await ipcRenderer.invoke('get-ventas-for-day',fecha.value).then((result)=>{
            ventas = JSON.parse(result);
        });
      if (filtro === "Ingresos") {
            listarVentas(ventas);
        }
    }
});

selectMes.addEventListener('click',async e=>{
    if (filtro === "Ingresos"){
        await ipcRenderer.invoke('get-ventas-for-month',selectMes.value).then((result)=>{
            ventas = JSON.parse(result);
        });
        listarVentas(ventas);
    }else{
        gastos = (await axios.get(`${URL}gastos/mes/${selectMes.value}`)).data;
        listarGastos(gastos);
    }
});

inputAnio.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        if (filtro === "Ingresos") {
            await ipcRenderer.invoke('get-ventas-for-year',inputAnio.value).then((result)=>{
                ventas = JSON.parse(result);
            });
            listarVentas(ventas)
        }else{
            gastos = (await axios.get(`${URL}gastos/anio/${inputAnio.value}`)).data;
            listarGastos(gastos)
        }
    }
});

tbody.addEventListener('click',async e=>{
    const id = e.target.nodeName === "TD" ? e.target.parentNode.id : e.target.id;
    
    seleccionado && seleccionado.classList.remove('seleccionado');

    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "BUTTON"){
        seleccionado = e.target.parentNode.parentNode;
    };

    seleccionado.classList.add('seleccionado');

    const trs = document.querySelectorAll("tbody .venta" + id)

    for await(let tr of trs){
        tr.classList.toggle('none');
    }
});

tbodyGastos.addEventListener('click',e=>{
    seleccionado && seleccionado.classList.remove('seleccionado')
    seleccionado = e.target.nodeName === "TD" ? e.target.parentNode : e.target
    seleccionado.classList.add('seleccionado')
});

const listarVentas = async (ventas)=>{
    tbody.innerHTML = ``;
    let lista = [];
    //organizamos las ventas por fecha
    ventas.sort((a,b)=>{
        if (a.fecha>b.fecha) {
            return 1;
        }else if(b.fecha>a.fecha){
            return -1;
        }
        return 0;
    });
    //filtramos las ventas si son contadas o tarjeta
    if (tipoVenta === "CD") {
        lista = ventas.filter(venta=>(venta.tipo_venta === "CD"));
    }else if(tipoVenta === "CC"){
        lista = ventas;
    }else if(tipoVenta === "T"){
        lista = ventas.filter(venta=>venta.tipo_venta === "T");
    }else{
        lista = ventas;
    }
    let totalVenta = 0;
    for await(let venta of lista){

        const tr = document.createElement('tr');
        tr.id = venta._id;
        tr.classList.add('bold')

        const tdNumero =  document.createElement('td');
        const tdFecha =  document.createElement('td');
        const tdCliente =  document.createElement('td');
        const tdCodProducto =  document.createElement('td');
        const tdProducto =  document.createElement('td');
        const tdCantidad =  document.createElement('td');
        const tdPrecioTotal = document.createElement('td');
        const tdHora = document.createElement('td');
        const tdVendedor = document.createElement('td');
        const tdCaja = document.createElement('td');
        const tdAccion = document.createElement('td');

        const buttonAccion = document.createElement('button');

        buttonAccion.addEventListener('click', eliminarVenta);

        tdAccion.classList.add('tool');
        buttonAccion.classList.add('material-icons')
        buttonAccion.innerText = 'delete';

        tdAccion.appendChild(buttonAccion);



        tdNumero.innerHTML = venta.numero;
        tdFecha.innerHTML = venta.fecha.slice(0,10).split('-',3).reverse().join('/');
        tdHora.innerHTML = venta.fecha.slice(11,19).split(':',3).join(':');
        tdCliente.innerHTML = venta.cliente;
        tdCodProducto.innerHTML = venta.tipo_comp;
        tdProducto.innerHTML = venta.direccion;
        tdCantidad.innerText = venta.telefono;
        tdPrecioTotal.innerHTML = venta.tipo_comp === "Nota Credito C" ? redondear(venta.precio * -1,2) : venta.precio.toFixed(2);
        tdVendedor.innerHTML = venta.vendedor ? venta.vendedor : "";
        tdCaja.innerHTML = venta.caja;

        tr.appendChild(tdNumero);
        tr.appendChild(tdFecha);
        tr.appendChild(tdCliente);
        tr.appendChild(tdCodProducto);
        tr.appendChild(tdProducto);
        tr.appendChild(tdCantidad);
        tr.appendChild(tdPrecioTotal);
        tr.appendChild(tdVendedor);
        tr.appendChild(tdCaja);
        tr.appendChild(tdHora);
        tr.appendChild(tdAccion);

        tbody.appendChild(tr);

        //aca listamos los productos de cada venta
        if (venta.listaProductos) {
           for await(let {cantidad,producto} of  venta.listaProductos){
                if (producto.length !== 0) {
                    const trProducto = document.createElement('tr');
                    trProducto.classList.add('none');
                    trProducto.classList.add(`venta${venta._id}`);

                    const tdNumeroProducto = document.createElement('td');
                    const tdFechaProducto = document.createElement('td');
                    const tdClienteProducto = document.createElement('td');
                    const tdIdProducto = document.createElement('td');
                    const tdDescripcion = document.createElement('td');
                    const tdCantidad = document.createElement('td');
                    const tdTotalProducto = document.createElement('td');

                    tdNumeroProducto.innerHTML = venta.numero;
                    tdFechaProducto.innerHTML = tdFecha.innerText;
                    tdClienteProducto.innerHTML = venta.cliente;
                    tdIdProducto.innerHTML = producto._id === undefined ? " " : producto._id;
                    tdDescripcion.innerHTML = producto.descripcion;
                    tdCantidad.innerHTML = cantidad.toFixed(2);
                    tdTotalProducto.innerHTML = (cantidad*producto.precio).toFixed(2);

                    trProducto.appendChild(tdNumeroProducto);
                    trProducto.appendChild(tdFechaProducto);
                    trProducto.appendChild(tdClienteProducto);
                    trProducto.appendChild(tdIdProducto);
                    trProducto.appendChild(tdDescripcion);
                    trProducto.appendChild(tdCantidad);
                    trProducto.appendChild(tdTotalProducto);

                    tbody.appendChild(trProducto);
            };
            };
        }
        

        totalVenta += venta.tipo_comp === "Nota Credito C" ? venta.precio * -1 : venta.precio;
    };
    total.value = totalVenta.toFixed(2);
}

const listarGastos = (gastos)=>{
    tbodyGastos.innerHTML = "";
    let totalVenta = 0;
    for(let gasto of gastos){
        const fecha = gasto.fecha.slice(0,10).split('-',3);
        const tr = `
        <tr id=${gasto._id}>
            <td>${fecha[2]}/${fecha[1]}/${fecha[0]}</td>
            <td>${gasto.descripcion}</td>
            <td>${redondear(gasto.importe * -1,2)}</td>
        </tr>
    `
    tbodyGastos.innerHTML += tr;
    totalVenta -= gasto.importe;
    }
    total.value = redondear(totalVenta,2);
};

volver.addEventListener('click',e=>{
    location.href = "../menu.html";
});

document.addEventListener('keyup',e=>{
    if (e.key === "Escape" && !document.activeElement.classList.contains('swal2-confirm')) {
        location.href = '../menu.html';
    }
});


