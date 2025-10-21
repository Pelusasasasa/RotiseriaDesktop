const { cerrarVentana, redondear, agregarMovimientoVendedores, cargarNotaCredito, getParameterByName } = require("../helpers");

const sweet = require('sweetalert2');
const axios = require('axios');
require('dotenv').config();
const URL = process.env.ROTISERIA_URL;

let seleccionado;
let subSeleccionado;

const tarjeta = document.querySelector('.tarjeta');
const contado = document.querySelector('.contado');

const facturas = document.getElementById('facturas');

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
let eliminadas = false;
let filtro = "Ingresos";
const fechaHoy = new Date();
let d = fechaHoy.getDate();
let m = fechaHoy.getMonth() + 1;
let a = fechaHoy.getFullYear();

m = m < 10 ? `0${m}` : m;
d = d < 10 ? `0${d}` : d;

pestaña.addEventListener('click', async e => {
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
        } else if (filtro === "Ingresos") {
            document.querySelector('.listado').classList.remove('none');
            document.querySelector('.gastos').classList.add('none');
            //Mostrar botones
            tarjeta.classList.remove('none');
            contado.classList.remove('none');
            let retornar = await verQueTraer();
            tipoVenta = "CD";
            listarVentas(retornar);
        } else if (filtro === "Presupuestos") {
            contado.classList.remove('none');
            tarjeta.classList.add('none');
            let retornar = await verQueTraer();
            tipoVenta = "PP";
            listarVentas(retornar)
        } else {
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

window.addEventListener('load', async e => {
    fecha.value = `${a}-${m}-${d}`;
    selectMes.value = m;
    inputAnio.value = a;

    const  { data } = await axios.get(`${URL}venta/day/${fecha.value}`);
    if(data.ok){
        ventas = data.ventas;
        listarVentas(data.ventas);
    }else{
        await sweet.fire('Error al traer las ventas', 'No se pudieron obtener las ventas', 'error');
    }
    
});

document.addEventListener('keydown', e => {
    if (e.keyCode === 18) {
        document.addEventListener('keydown', async event => {
            if (event.keyCode === 120) {
                eliminadas = !eliminadas    ;
                if(!eliminadas) {
                    const retorno = await verQueTraer();
                    listarVentas(retorno);
                }else{
                    const { data } = await axios.get(`${URL}venta/eliminadas`);
                    if(data.ok){
                        listarVentas(data.ventas);
                    }
                }

            }
        }, { once: true })
}})


const eliminarVenta = async (e) => {
    const target = e.target.parentNode.parentNode;
    const id = target.id;

    const { isConfirmed } = await sweet.fire({
        title: target.children[3].innerText === 'Factura C' ? '¿Hacer una Nota de Credito?' : '¿Seguro queres Eliminar La venta?',
        confirmButtonText: 'Aceptar',
        showCancelButton: true
    });

    if (isConfirmed) {
        let venta = {}
        try {
            const { data } = await axios.get(`${URL}venta/${id}`);
            if(!data.ok) return await sweet.fire('Error al obtener la venta', data.msg, 'error');
            venta = data.venta;
        } catch (error) {
            console.log(error.response.data.msg);
            await sweet.fire('Error al obtener la venta', error.response.data.msg, 'error');
        }
        const { cod_doc, tipo_venta, tipo_comp, num_doc, precio, gravado21, gravado0, gravado105, iva21, iva0, iva105, afip } = venta;

        if (tipo_comp === 'Factura C') {
            const numero = afip.numero.toString().padStart(8, '0');

            const infoParaNotaCredito = { cod_doc, num_doc, precio, gravado21, gravado0, gravado105, iva21, iva0, iva105, numero };

            let res;
            try {
                res = await cargarNotaCredito(infoParaNotaCredito, numero);
            } catch (error) {
                await sweet.fire('Error al cargar la nota de credito', 'No se pudo cargar la nota de credito', 'error');
            }

            venta._id = venta._id
            venta.cod_comp = 13;
            venta.tipo_comp = 'Nota Credito C';
            venta.afip.numero = res.numero;
            venta.afip.puntoVenta = res.puntoVenta;
            venta.afip.QR = res.QR;
            venta.afip.cae = res.cae;
            venta.afip.vencimiento = res.vencimiento;
            venta.notaCredito = true;
            
            let aux;
            try {
                const { data } = await axios.patch(`${URL}venta/notaCredito/${venta._id}`);
                if(!data.ok) return await sweet.fire('Error al cargar la nota de credito', data.msg, 'error');
                aux = data.venta;
            } catch (error) {
                console.log(error.reponse.data.msg);
                await sweet.fire('Error al cargar la nota de credito', error.response.data.msg, 'error');
            };
            
            
            delete venta._id;

            //Modificamos la lista de prodcutos para hacer que el movimiento se ponga en negativo
            venta.listaProductos.map(elem => {
                elem.cantidad = elem.cantidad * -1;
            });

            try {
                const { data } = await axios.post(`${URL}venta`, venta);
                ventas.push(data.venta);
                //Cargamos la venta y luego la listams, que ya seria la nota de credito
                listarVentas(ventas)
            } catch (error) {
                console.log(error);
                console.log('No se pudo cargar la venta o listarla');
            }

        } else {

            const { data } = await axios.delete(`${URL}venta/${id}`);

            if(data.ok){
                ventas = ventas.filter(elem => elem._id !== data.ventaEliminada._id);
                const trEliminado = document.getElementById(`${data.ventaEliminada._id}`);

                //Son los tr que muestran los productos de una venta
                const alltrMovEliminados = document.querySelectorAll(`.venta${data.ventaEliminada._id}`);

                for (let elem of alltrMovEliminados) {
                    tbody.removeChild(elem);
                };
                tbody.removeChild(trEliminado);
                total.value = redondear(parseFloat(total.value) - parseFloat(trEliminado.children[6].innerText), 2);
            }else{
                await sweet.fire('Error al eliminar la venta', 'No se pudo eliminar la venta', 'error');
            }
        }
    }
};

const verQueTraer = async () => {
    console.log(botonSeleccionado);
    if (botonSeleccionado.classList.contains("botonDia")) {
        
        if (filtro === "Ingresos") {
            const { data} = await axios.get(`${URL}venta/day/${fecha.value}`)
            return ([...data.ventas]);
        } else if (filtro === "Presupuestos") {
            presupuestos = (await axios.get(`${URL}presupuesto/forDay/${fecha.value}`)).data;
            return presupuestos
        } else {
            return ((await axios.get(`${URL}gastos/dia/${fecha.value}`)).data);
        }
    } else if (botonSeleccionado.classList.contains("botonMes")) {
        
        if (filtro === "Ingresos") {
            const { data } = await axios.get(`${URL}venta/mes/${selectMes.value}`);

            if(data.ok){
                return ([...data.ventas]);
            }
        } else {
            return ((await axios.get(`${URL}gastos/mes/${selectMes.value}`)).data);
        }
    } else {
        if (filtro === "Ingresos") {
            const { data } = await axios.get(`${URL}venta/anio/${inputAnio.value}`);

            if(data.ok){
                return ([...data.ventas])
            };
        } else {
            return ((await axios.get(`${URL}gastos/anio/${inputAnio.value}`)).data)
        }
    }
};

//Cuando se hace click en el boton tarjeta, lo que hacemos es mostrar las ventas con tarjetas
tarjeta.addEventListener('click', e => {
    if (!tarjeta.classList.contains('buttonSeleccionado')) {
        contado.classList.remove('buttonSeleccionado');
        tarjeta.classList.add('buttonSeleccionado');
        tipoVenta = "T";
        listarVentas(ventas)
    };
});

//Cuando hacemos click en contado mostramos las ventas en contado
contado.addEventListener('click', e => {
    if (!contado.classList.contains('buttonSeleccionado')) {
        tarjeta.classList.remove('buttonSeleccionado');
        contado.classList.add('buttonSeleccionado');
        tipoVenta = "CD";
        listarVentas(ventas)
    };
});

//muestra las ventas del dia cuando tocamos en el boton
botonDia.addEventListener('click', async e => {
    botonSeleccionado.classList.remove('seleccionado');
    botonSeleccionado = botonDia;
    dia.classList.remove('none');
    mes.classList.add('none');
    anio.classList.add('none');

    botonSeleccionado.classList.add('seleccionado');
    if (filtro === "Ingresos" || filtro === "Cuenta Corriente") {
        const { data } = await axios.get(`${URL}venta/day/${fecha.value}`);

        if (filtro === "Ingresos") {
            listarVentas(data.ventas);
        } else {
            listarVentas(cuentasCorrientes);
        }
    } else if (filtro === "Presupuestos") {
        presupuestos = (await axios.get(`${URL}presupuesto/forDay/${fecha.value}`)).data;
        listarVentas(presupuestos);
    };
});

//muestra las ventas del mes cuando tocamos en el boton
botonMes.addEventListener('click', async e => {
    botonSeleccionado.classList.remove('seleccionado');
    botonSeleccionado = botonMes;
    botonSeleccionado.classList.add('seleccionado');

    mes.classList.remove('none');
    dia.classList.add('none');
    anio.classList.add('none');


    //vemos que tipo de filtro es y ahi vemos si traemos los ingresos o gastos
    if (filtro === "Ingresos") {
        const { data } = await axios.get(`${URL}venta/mes/${selectMes.value}`);
        if(data.ok){
            ventas = data.ventas;
            listarVentas(ventas);
        }else{
            await sweet.fire('Error al traer las ventas', 'No se pudieron obtener las ventas', 'error');
        };

        
    } else {
        gastos = (await axios.get(`${URL}gastos/mes/${selectMes.value}`)).data;
        listarGastos(gastos);
    }
});

//muestra las ventas del año cuando tocamos en el boton
botonAnio.addEventListener('click', async e => {
    botonSeleccionado.classList.remove('seleccionado');
    botonSeleccionado = botonAnio;
    anio.classList.remove('none');
    dia.classList.add('none');
    mes.classList.add('none');

    botonSeleccionado.classList.add('seleccionado');
    
    const { data } = await axios.get(`${URL}venta/anio/${inputAnio.value}`);
    if(data.ok){
        ventas = data.ventas;
    }
    
    listarVentas(ventas);
});

fecha.addEventListener('keypress', async e => {
    if ((e.key === "Enter")) {
        const { data } = await axios.get(`${URL}venta/day/${fecha.value}`);
        if (data.ok) {
            ventas = data.ventas;
            listarVentas(ventas);
        }else{
            await sweet.fire('Error al traer las ventas', 'No se pudieron obtener las ventas', 'error');
        };    
        
    }
});

selectMes.addEventListener('click', async e => {
    const  { data } = await axios.get(`${URL}venta/mes/${selectMes.value}`);
    if(data.ok){
        ventas = data.ventas;
        listarVentas(ventas);   
    }else{
        await sweet.fire('Error al traer las ventas', 'No se pudieron obtener las ventas', 'error');
    };
});

inputAnio.addEventListener('keypress', async e => {
    if (e.key === "Enter") {
        const { data } = await axios.get(`${URL}venta/anio/${inputAnio.value}`);

        if(data.ok){
            ventas = data.ventas;
            listarVentas(ventas);
        }
        
    }
});

tbody.addEventListener('click', async e => {
    const id = e.target.nodeName === "TD" ? e.target.parentNode.id : e.target.id;

    seleccionado && seleccionado.classList.remove('seleccionado');

    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
    } else if (e.target.nodeName === "BUTTON") {
        seleccionado = e.target.parentNode.parentNode;
    };

    seleccionado.classList.add('seleccionado');

    const trs = document.querySelectorAll("tbody .venta" + id)

    for await (let tr of trs) {
        tr.classList.toggle('none');
    }
});

tbodyGastos.addEventListener('click', e => {
    seleccionado && seleccionado.classList.remove('seleccionado')
    seleccionado = e.target.nodeName === "TD" ? e.target.parentNode : e.target
    seleccionado.classList.add('seleccionado')
});

const listarVentas = async (ventas) => {
    tbody.innerHTML = ``;
    let lista = []; 
    //organizamos las ventas por fecha
    ventas.sort((a, b) => {
        if (a.fecha > b.fecha) {
            return 1;
        } else if (b.fecha > a.fecha) {
            return -1;
        }
        return 0;
    });

    //filtramos las ventas si son contadas o tarjeta
    if (tipoVenta === "CD") {
        lista = ventas.filter(venta => (venta.tipo_venta === "CD"));
    } else if (tipoVenta === "CC") {
        lista = ventas;
    } else if (tipoVenta === "T") {
        lista = ventas.filter(venta => venta.tipo_venta === "T");
    } else {
        lista = ventas;
    };


    if(facturas.checked){
        lista = lista.filter(venta => venta.tipo_comp === 'Factura C' || venta.tipo_comp === 'Nota Credito C')
    };

    let totalVenta = 0;
    const fragment = document.createDocumentFragment();
    for await (let venta of lista) {
        const tr = document.createElement('tr');
        tr.id = venta._id;
        tr.classList.add('bold');
        if(venta.eliminada){
            tr.classList.add('eliminada');
        }

        let textoDispositivo = '';

        if(venta.dispositivo === 'DESKTOP'){
            textoDispositivo = 'PC';
        }else if(venta.dispositivo === 'MOBILE'){
            textoDispositivo = 'CELULAR';
        }else if(venta.dispositivo === 'WEB'){
            textoDispositivo = 'WEB';
        }else{
            textoDispositivo = 'PC';
        }

        const tdNumero = document.createElement('td');
        const tdFecha = document.createElement('td');
        const tdCliente = document.createElement('td');
        const tdCodProducto = document.createElement('td');
        const tdProducto = document.createElement('td');
        const tdCantidad = document.createElement('td');
        const tdPrecioTotal = document.createElement('td');
        const tdHora = document.createElement('td');
        const tdDispositivo = document.createElement('td');
        const tdAccion = document.createElement('td');

        const buttonAccion = document.createElement('button');

        buttonAccion.addEventListener('click', eliminarVenta);

        tdAccion.classList.add('tool');
        buttonAccion.classList.add('material-icons')
        if (venta.F) {
            buttonAccion.innerText = venta.tipo_comp === 'Factura C' ? 'assignment' : '';
        } else {
            buttonAccion.innerText = 'delete';
        }

        tdAccion.appendChild(buttonAccion);

        const fechaLocal = new Date(venta.fecha).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }).split(' ', 2);

        tdNumero.innerText = venta.numero;
        tdFecha.innerText = fechaLocal[0];
        tdHora.innerText = fechaLocal[1];
        tdCliente.innerText = venta.cliente;
        tdCodProducto.innerText = venta.tipo_comp;
        tdProducto.innerText = venta.direccion;
        tdCantidad.innerText = venta.telefono;
        tdPrecioTotal.innerText = venta.tipo_comp === "Nota Credito C" ? redondear(venta.precio * -1, 2) : venta.precio.toFixed(2);
        tdDispositivo.innerText = textoDispositivo;

        tr.appendChild(tdNumero);
        tr.appendChild(tdFecha);
        tr.appendChild(tdCliente);
        tr.appendChild(tdCodProducto);
        tr.appendChild(tdProducto);
        tr.appendChild(tdCantidad);
        tr.appendChild(tdPrecioTotal);
        tr.appendChild(tdHora);
        tr.appendChild(tdDispositivo);
        (venta.tipo_comp !== 'Nota Credito C' && !venta.notaCredito) && tr.appendChild(tdAccion);

        fragment.appendChild(tr);

        //aca listamos los productos de cada venta
        if (venta.listaProductos) {
            for await (let { cantidad, producto } of venta.listaProductos) {
                if (producto) {
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

                    tdNumeroProducto.innerText = venta.numero;
                    tdFechaProducto.innerText = tdFecha.innerText;
                    tdClienteProducto.innerText = venta.cliente;
                    tdIdProducto.innerText = producto._id === undefined ? " " : producto._id;
                    tdDescripcion.innerText = producto.descripcion;
                    tdCantidad.innerText = cantidad.toFixed(2);
                    tdTotalProducto.innerText = (cantidad * producto.precio).toFixed(2);

                    trProducto.appendChild(tdNumeroProducto);
                    trProducto.appendChild(tdFechaProducto);
                    trProducto.appendChild(tdClienteProducto);
                    trProducto.appendChild(tdIdProducto);
                    trProducto.appendChild(tdDescripcion);
                    trProducto.appendChild(tdCantidad);
                    trProducto.appendChild(tdTotalProducto);

                    fragment.appendChild(trProducto);
                };
            };
        }


        totalVenta += venta.tipo_comp === "Nota Credito C" ? venta.precio * -1 : venta.precio;
    };
    tbody.appendChild(fragment)
    total.value = totalVenta.toFixed(2);
};

const listarGastos = (gastos) => {
    tbodyGastos.innerHTML = "";
    let totalVenta = 0;
    for (let gasto of gastos) {
        const fecha = gasto.fecha.slice(0, 10).split('-', 3);
        const tr = `
        <tr id=${gasto._id}>
            <td>${fecha[2]}/${fecha[1]}/${fecha[0]}</td>
            <td>${gasto.descripcion}</td>
            <td>${redondear(gasto.importe * -1, 2)}</td>
        </tr>
    `
        tbodyGastos.innerHTML += tr;
        totalVenta -= gasto.importe;
    }
    total.value = redondear(totalVenta, 2);
};

volver.addEventListener('click', e => {
    location.href = "../menu.html";
});

document.addEventListener('keyup', e => {
    if (e.key === "Escape" && !document.activeElement.classList.contains('swal2-confirm')) {
        location.href = '../menu.html';
    }
});

facturas.addEventListener('change', () => {
    listarVentas(ventas)
});
