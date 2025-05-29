require('dotenv').config();
const { ipcRenderer } = require('electron');
const { apretarEnter, redondear, cargarFactura, ponerNumero, verCodigoComprobante, verTipoComprobante, verSiHayInternet, getParameterByName } = require('../helpers');

const sweet = require('sweetalert2');
const axios = require('axios');
const path = require('path');
const archivo = require('../configuracion.json');

const URL = process.env.ROTISERIA_URL;

let tarjetaSeleccionada;
let vendedor = getParameterByName('vendedor');


//Parte Cliente
const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const telefono = document.querySelector('#telefono');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const cuit = document.querySelector('#cuit');
const condicionIva = document.querySelector('#condicion');

//parte Buscador
const seleccion = document.getElementById('seleccion');
const buscador = document.getElementById('buscarProducto');
const seccionTarjetas = document.querySelector('.tarjetas');

//Parte Producto
const cantidad = document.querySelector('#cantidad');
const codBarra = document.querySelector('#cod-barra')
const precioU = document.querySelector('#precio-U');
const rubro = document.querySelector('#rubro');
const tbody = document.querySelector('.tbody');
const select = document.querySelector('#rubro');

//parte totales
const total = document.querySelector('#total');
const inputRecibo = document.querySelector('#recibo');
const porcentaje = document.querySelector('#porcentaje');
const radio = document.querySelectorAll('input[name="condicion"]');
const cuentaCorrientediv = document.querySelector('.cuentaCorriente');
const cobrado = document.getElementById('cobrado');
const vuelto = document.getElementById('vuelto');

//botones
const facturar = document.querySelector('.facturar');
const volver = document.querySelector('.volver');
const impresion = document.querySelector("#impresion");

//alerta
const alerta = document.querySelector('.alerta');

//body
const body = document.querySelector('body');


let tipoFactura = getParameterByName("tipoFactura");
let facturaAnterior;

let movimientos = [];
let descuentoStock = [];
let idProducto = 0;
let situacion = "blanco";
let descuento = 0;
let listaProductos = [];
let pedido;

//Empanadas
let precioEmpanadas = 0;
let empanadas = 0;
let descuentoPorDocena = false; //Se usa para que en el ticket si esto es true se muetre un texto que diga que se hizo un descuento por una docena y media

//Por defecto ponemos el A Consumidor Final y tambien el select
window.addEventListener('load', async e => {
    try {
        const { data } = await axios.get(`${URL}carta`);
        
        if(!data.ok) return await sweet.fire('No se pudo obtener la carta empanada', data.msg, 'error');

        precioEmpanadas = data.carta;
        listarCliente(1);//listanos los clientes
        filtrar();
    } catch (error) {
        console.log(error.response.data.msg);
        await sweet.fire('No se pudo obtener la carta de empanada', error.response.data.msg, 'error');
    };
});

document.addEventListener('keydown', e => {
    console.log(e.keyCode);
    if (e.keyCode === 18) {
        document.addEventListener('keydown', event => {
            if (event.keyCode === 120) {
                body.classList.toggle('negro');
                situacion = situacion === "negro" ? "blanco" : "negro";
                cambiarSituacion(situacion);
            }
        }, { once: true })
    } else if (e.keyCode === 113) {
        const opciones = {
            path: "clientes/agregarCliente.html",
            ancho: 900,
            altura: 600
        }
        ipcRenderer.send('abrir-ventana', opciones);
    } else if (e.keyCode === 114) {
        const opciones = {
            path: "productos/agregarProducto.html",
            ancho: 900,
            altura: 650
        };
        ipcRenderer.send('abrir-ventana', opciones);
    } else if (e.keyCode === 116) {
        const opciones = {
            path: "gastos/gastos.html",
            ancho: 500,
            altura: 400
        }
        ipcRenderer.send('abrir-ventana', opciones);
    } else if (e.keyCode === 117) {
        impresion.checked = !impresion.checked;
    }
});

//Buscamos un cliente, si sabemos el codigo directamente apretamos enter
codigo.addEventListener('keypress', async e => {
    if (e.key === "Enter") {
        if (codigo.value === "") {
            const opciones = {
                path: './clientes/clientes.html',
                botones: false,
            }
            ipcRenderer.send('abrir-ventana', opciones)
        } else {
            listarCliente(codigo.value)
        }
    }
});

codBarra.addEventListener('keypress', async e => {
    if (e.key === "Enter" && codBarra.value !== "" && codBarra.value !== "0") {
        cantidad.focus();
    } else if (e.key === "Enter" && codBarra.value === "") {
        //Esto abre una ventana donde lista todos los productos
        const opciones = {
            path: "./productos/productos.html",
            botones: false
        }
        ipcRenderer.send('abrir-ventana', opciones);
    } else if (codBarra.value === "0") {
        cantidad.focus();
    }

    if (e.keyCode === 37) {
        cantidad.focus();
    }
});

descripcion.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        precioU.focus();
    }
});

precioU.addEventListener('keypress', async e => {
    if ((e.key === "Enter")) {
        if (precioU.value !== "") {
            crearProducto();
            // rubro.focus();   
        } else {
            await sweet.fire({
                title: "Poner un precio al Producto",
            });
        }
    }
});

const crearProducto = () => {
    idProducto++;
    const producto = {
        descripcion: descripcion.value.toUpperCase(),
        precio: parseFloat(precioU.value),
        idTabla: `${idProducto}`,
        impuesto: 0,
        productoCreado: true
    };

    listaProductos.push({ cantidad: parseFloat(cantidad.value), producto });
    tbody.innerHTML += `
        <tr id=${idProducto}>
            <td></td>
            <td>${cantidad.value}</td>
            <td>${descripcion.value.toUpperCase()}</td>
            <td>${parseFloat(producto.precio).toFixed(2)}</td>
            <td>${redondear((producto.precio * parseFloat(cantidad.value)), 2)}</td>
            <td class=acciones>
                <div class=tool>
                    <span class=material-icons>delete</span>
                    <p class=tooltip>Eliminar</p>
                </div>
            </td>
        </tr>
    `;
    tbody.scrollIntoView({
        block: "end"
    });

    total.value = redondear((parseFloat(total.value) + parseFloat(producto.precio) * parseFloat(cantidad.value)), 2);
    totalGlobal = parseFloat(total.value);
    cantidad.value = "1.00";
    codBarra.value = "";
    precioU.value = "";
    descripcion.value = "";
    codBarra.focus();
};

ipcRenderer.on('recibir', (e, args) => {
    const { tipo, informacion, cantidad: cant, descripcion: desc } = JSON.parse(args);
    tipo === "cliente" && listarCliente(informacion);
    tipo === "producto" && (codBarra.value = informacion);
    tipo === "producto" && (cantidad.value = cant);
    tipo === "producto" && (descripcion.value = desc);
    tipo === "producto" && listarProducto(codBarra.value);
    tipo === "Ningun cliente" && nombre.focus();
});

//Vemos que input tipo radio esta seleccionado
const verTipoVenta = () => {
    let retornar;
    radio.forEach(input => {
        if (input.checked) {
            retornar = input.value;
        }
    });
    return retornar;
};

facturar.addEventListener('click', async e => {
    //Verificamos los datos para la venta si estan correctos
    if(!verificarDatosParaventa()) return;
    
    alerta.classList.remove('none');
    
    const venta = {};

    venta.cliente = nombre.value;
    venta.fecha = new Date();
    venta.idCliente = codigo.value;
    venta.precio = parseFloat(total.value);
    venta.descuento = descuento;
    venta.tipo_venta = await verTipoVenta();
    venta.listaProductos = listaProductos;

    //Ponemos propiedades para la factura electronica
    venta.cod_comp = situacion === "blanco" ? await verCodigoComprobante(tipoFactura, cuit.value, condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value) : 0;
    venta.tipo_comp = situacion === "blanco" ? await verTipoComprobante(venta.cod_comp) : "Comprobante";
    venta.num_doc = cuit.value !== "" ? cuit.value : "00000000";
    venta.cod_doc = await verCodigoDocumento(cuit.value);
    venta.condicionIva = condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value
    const [iva21, iva0, gravado21, gravado0, iva105, gravado105, cantIva] = await sacarIva(listaProductos); //sacamos el iva de los productos
    venta.iva21 = iva21;
    venta.iva0 = iva0;
    venta.gravado0 = gravado0;
    venta.gravado21 = gravado21;
    venta.iva105 = iva105;
    venta.gravado105 = gravado105;
    venta.cantIva = cantIva;
    venta.direccion = direccion.value;
    venta.telefono = telefono.value;
    venta.descuentoPorDocena = descuentoPorDocena;
    venta.caja = require('../configuracion.json').caja; //vemos en que caja se hizo la venta
    
    venta.facturaAnterior = facturaAnterior ? facturaAnterior : "";
    
    if (situacion === "blanco") {
        alerta.classList.remove('none');
        venta.afip = await cargarFactura(venta, facturaAnterior ? true : false);
        venta.F = true;
    } else {
        venta.F = false;
        alerta.children[1].innerHTML = "Generando Venta";
    };
        

    const {isConfirmed} = await sweet.fire({
            title: "Imprimir Ticket Cliente",
            confirmButtonText: "Aceptar",
            showCancelButton: true
    });

    if(isConfirmed){
        venta.imprimirCliente = true
    }else{
        venta.imprimirCliente = false
    };
        
    try {

        const { data } = await axios.post(`${URL}venta`, venta);
        if(!data.ok) return await sweet.fire('Error al hacer la venta', error.response.data.msg, 'error');

        location.reload();

    } catch (error) {

        console.log(error.response.data.msg);
        sweet.fire('Error al hacer la venta', error.reponse.data.msg, 'error');

    };

    alerta.classList.add('none')
});


//Lo que hacemos es listar el cliente traido
const listarCliente = async (id) => {
    codigo.value = id;
    let cliente;
    try {
        const { data } = await axios.get(`${URL}cliente/${id}`);
        cliente = data.cliente;
        if(!data.ok) return await sweet.fire('No se pudo obtener el cliente', data.msg, 'error');
    } catch (error) {
        console.log(error.response.data.msg);
        return await sweet.fire('No se pudo obtener el cliente', error.response.data.msg, 'error')
    };

    if (cliente !== "") {
        nombre.value = cliente.nombre;
        saldo.value = cliente.saldo;
        telefono.value = cliente.telefono;
        localidad.value = cliente.localidad;
        direccion.value = cliente.direccion;
        cuit.value = cliente.cuit === "" ? "00000000" : cliente.cuit;
        condicionIva.value = cliente.condicionIva ? cliente.condicionIva : "Consumidor Final";

        codBarra.focus();
    } else {
        codigo.value = "";
        codigo.focus();
    }
};

//Lo que hacemos es listar el producto traido
const listarProducto = async (id) => {
    let producto;
    try {
        const { data } = await axios.get(`${URL}producto/${id}`);
        if(!data.ok) return await sweet.fire('Error al obtener el producto', data.msg, 'error');    
        producto = data.producto;
    } catch (error) {
        console.log(error.response.data.msg);
        await sweet.fire('Error al obtener el producto', error.response.data.msg)
    }
    
    

    if (producto) {
        //Vemos si el producto ya fue usado
        const productoYaUsado = listaProductos.find(({ producto: product }) => {
            if (product._id === producto._id) {
                return product
            };
        });

        if (producto !== "" && !productoYaUsado) {
            if (producto.stock === 0 && archivo.stockNegativo) {
                await sweet.fire({
                    title: "Producto con Stock en 0"
                });
            };
            if (producto.stock - (parseFloat(cantidad.value)) < 0 && archivo.stockNegativo) {
                await sweet.fire({
                    title: "Producto con Stock menor a 0",
                });
            }

            idProducto++;
            producto.idTabla = `${idProducto}`;
            listaProductos.push({ cantidad: parseFloat(cantidad.value), producto });
            codBarra.value = producto._id;
            precioU.value = redondear(producto.precio, 2);
            total.value = redondear(parseFloat(total.value) + (parseFloat(cantidad.value) * parseFloat(precioU.value)), 2);

            tbody.innerHTML += `
            <tr id=${producto.idTabla}>
                <td>${codBarra.value}</td>
                <td>${parseFloat(cantidad.value).toFixed(2)}</td>
                <td>${producto.descripcion.toUpperCase()}</td>
                <td>${parseFloat(precioU.value).toFixed(2)}</td>
                <td>${redondear(parseFloat(precioU.value) * parseFloat(cantidad.value), 2)}</td>
                <td class=acciones>
                    <div class=tool>
                        <span class=material-icons>edit</span>
                        <p class=tooltip>Modificar</p>
                    </div>
                    <div class=tool>
                        <span class=material-icons>manage_search</span>
                        <p class=tooltip>Observaciones</p>
                    </div>
                    <div class=tool>
                        <span class=material-icons>delete</span>
                        <p class=tooltip>Eliminar</p>
                    </div>
                </td>
            </tr>
            `;
            tbody.scrollIntoView({
                block: "end"
            });

            totalGlobal = parseFloat(total.value);

        } else if (producto !== "" && productoYaUsado) {
            productoYaUsado.cantidad += parseFloat(cantidad.value);
            producto.idTabla = productoYaUsado.producto.idTabla;
            const tr = document.getElementById(producto.idTabla);
            tr.children[1].innerHTML = redondear(parseFloat(tr.children[1].innerHTML) + parseFloat(cantidad.value), 2);
            tr.children[4].innerHTML = redondear(parseFloat(tr.children[1].innerHTML) * producto.precio, 2);
            total.value = redondear(parseFloat(total.value) + (parseFloat(cantidad.value) * producto.precio), 2);
            totalGlobal = parseFloat(total.value);
        };

        if (producto.seccion?.nombre === "EMPANADAS") {
            await calcularTotal();
            await calcularEmpanadas(producto, cantidad);
        };



        cantidad.value = "1.00";
        codBarra.value = "";
        descripcion.value = "";
        precioU.value = "";
        codBarra.focus();
    } else {
        descripcion.focus();
    }

};

//Cargamos el movimiento de producto a la BD
const cargarMovimiento = async ({ cantidad, producto, observaciones }, numero, cliente, tipo_venta, tipo_comp, caja, vendedor = "") => {
    const movimiento = {};
    movimiento.tipo_venta = tipo_venta;
    movimiento.codProd = producto._id;
    movimiento.producto = producto.descripcion;
    movimiento.cliente = cliente
    movimiento.cantidad = cantidad;
    movimiento.marca = producto.marca;
    movimiento.precio = producto.precio //parseFloat(redondear(producto.precio - (producto.precio * parseFloat(descuentoPor.value) / 100),2));
    movimiento.rubro = producto.rubro;
    movimiento.nro_venta = numero;
    movimiento.tipo_comp = tipo_comp;
    movimiento.caja = caja,
        movimiento.vendedor = vendedor;
    movimiento.observaciones = observaciones
    movimientos.push(movimiento);
};

const verificarDatosParaventa = async() => {

    if (codigo.value === "") {
        await sweet.fire({
            title: "Poner un codigo de cliente"
        });
        return false;
    };

    if (!verSiHayInternet() && situacion === "blanco") {
        await sweet.fire({
            title: "No se puede hacer la factura porque no hay internet"
        });

        return false;
    };

    if (cuit.value.length === 8 && condicionIva.value === "Responsable Inscripto" && archivo.condIva === "Inscripto") {
        if (tipoFactura) {
            await sweet.fire({
                title: "No se puede hacer Nota Credito B a un Inscripto"
            });
            return false;
        } else {
            await sweet.fire({
                title: "No se puede hacer Factura B a un Inscripto"
            });
            return false;
        }
    };

    return true;
};

let seleccionado;
//Hacemos para que se seleccione un tr

tbody.addEventListener('click', async e => {
    seleccionado && seleccionado.classList.remove('seleccionado');
    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
    } else if (e.target.nodeName === "DIV") {
        seleccionado = e.target.parentNode.parentNode;
    } else if (e.target.nodeName === "SPAN") {
        seleccionado = e.target.parentNode.parentNode.parentNode;
    }
    seleccionado.classList.add('seleccionado');
    if (e.target.innerHTML === "delete") {
        sweet.fire({
            title: "Borrar?",
            confirmButtonText: "Aceptar",
            showCancelButton: true
        }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                tbody.removeChild(seleccionado);
                calcularTotal();
                const productoABorrar = listaProductos.findIndex(({ producto, cantidad }) => seleccionado.id === producto.idTabla);
                if (listaProductos[productoABorrar].producto.seccion?.nombre === "EMPANADAS") {
                    empanadas -= parseFloat(seleccionado.children[1].innerText)
                }
                listaProductos.splice(productoABorrar, 1);
            }
        });
    } else if (e.target.innerText === "edit") {
        cambiarPrecio();
    } else if (e.target.innerText === "manage_search") {
        const producto = listaProductos.find(producto => producto.producto.idTabla === seleccionado.id);

        const observaciones = await sweet.fire({
            title: "Agregar Obseraciones",
            input: 'textarea',
            inputValue: producto.observaciones ? producto.observaciones : ""
        });
        producto.observaciones = observaciones.value ? observaciones.value : producto.observaciones;
    }
});

const sumarSaldo = async (id, nuevoSaldo, venta) => {
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    cliente.listaVentas.push(venta);
    if (facturaAnterior) {
        cliente.saldo = (cliente.saldo - nuevoSaldo);
    } else {
        cliente.saldo = (cliente.saldo + nuevoSaldo - parseFloat(inputRecibo.value)).toFixed(2);
    }
    await axios.put(`${URL}clientes/id/${id}`, cliente);
};

const sacarIva = (lista) => {
    let totalIva0 = 0;
    let totalIva21 = 0;
    let gravado21 = 0;
    let gravado0 = 0;
    let totalIva105 = 0;
    let gravado105 = 0;
    lista.forEach(({ producto, cantidad }) => {
        if (producto.impuesto === 21) {
            gravado21 += cantidad * producto.precio / 1.21;
            totalIva21 += cantidad * producto.precio - producto.precio / 1.21;
        } else if (producto.impuesto === 10.5) {
            gravado105 += cantidad * producto.precio / 1.105
            totalIva105 += (cantidad * producto.precio) - (producto.precio / 1.105);
        } else {
            gravado0 += cantidad * producto.precio / 1;
            totalIva0 += (cantidad * producto.precio) - (producto.precio / 1);
        }
    });
    let cantIva = 0
    if (gravado0 !== 0) {
        cantIva++;
    }
    if (gravado21 !== 0) {
        cantIva++;
    }
    if (gravado105 !== 0) {
        cantIva++;
    }
    return [parseFloat(totalIva21.toFixed(2)), parseFloat(totalIva0.toFixed(2)), parseFloat(gravado21.toFixed(2)), parseFloat(gravado0.toFixed(2)), parseFloat(totalIva105.toFixed(2)), parseFloat(gravado105.toFixed(2)), cantIva]
};

//Lo usamos para mostrar o ocultar cuestiones que tiene que ver con las ventas
const cambiarSituacion = (situacion) => {
    situacion === "negro" ? document.querySelector('#tarjetPago').parentNode.classList.add('none') : document.querySelector('#tarjetPago').parentNode.classList.remove('none');
};

//Ver Codigo Documento
const verCodigoDocumento = async (cuit) => {
    if (cuit !== "00000000" && cuit !== "") {
        if (cuit.length === 8) {
            return 96
        } else {
            return 80
        }
    }

    return 99
};

codigo.addEventListener('focus', e => {
    codigo.select();
});

nombre.addEventListener('focus', e => {
    nombre.select();
});

localidad.addEventListener('focus', e => {
    localidad.select();
});

telefono.addEventListener('focus', e => {
    telefono.select();
});

direccion.addEventListener('focus', e => {
    direccion.select();
});

total.addEventListener('focus', e => {
    total.select();
});

cobrado.addEventListener('focus', e => {
    cobrado.select();
});

cantidad.addEventListener('focus', e => {
    cantidad.select();
});

document.addEventListener('keydown', e => {
    if (e.key === "Escape") {

        sweet.fire({
            title: "Cancelar Venta?",
            "showCancelButton": true,
            "confirmButtonText": "Aceptar",
            "cancelButtonText": "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                location.href = "../menu.html";
            }
        });
    };
});

//ponemos un numero para la venta y luego mandamos a imprimirla
ipcRenderer.on('poner-numero', async (e, args) => {
    ponerNumero();
});

nombre.addEventListener('keypress', e => {
    apretarEnter(e, cuit);
});

cuit.addEventListener('keypress', e => {
    apretarEnter(e, telefono);
});

telefono.addEventListener('keypress', async e => {
    if (e.keyCode === 13) {
        const { data } = await axios.get(`${URL}cliente/forTelefono/${telefono.value.trim()}`);
        if(!data.ok) return await sweet.fire('Error al obtener el cliente por telefono', data.msg, 'error');

        const cliente = data.cliente;
        codigo.value = cliente._id;
        nombre.value = cliente.nombre;
        cuit.value = cliente.cuit;
        direccion.value = cliente.direccion;
        localidad.value = cliente.localidad;
        condicionIva.value = cliente.condicionIva;

    }
});

localidad.addEventListener('keypress', e => {
    apretarEnter(e, direccion);
});

direccion.addEventListener('keypress', e => {
    apretarEnter(e, condicionIva);
});

condicionIva.addEventListener('keypress', e => {
    e.preventDefault();
    apretarEnter(e, codBarra);
});

cantidad.addEventListener('keypress', async e => {
    if (e.keyCode === 13) {
        listarProducto(codBarra.value);
    }
});

cantidad.addEventListener('keydown', e => {
    if (e.keyCode === 39) {
        codBarra.focus();
    }
});

cobrado.addEventListener('keyup', (e) => {
    vuelto.value = redondear(parseFloat(cobrado.value) - parseFloat(total.value), 2);
});

//selects
cuit.addEventListener('focus', e => {
    cuit.select();
});

volver.addEventListener('click', () => {
    location.href = "../menu.html";
});

//Cambiamos los precios si elegimos
tbody.addEventListener('dblclick', cambiarPrecio);

async function cambiarPrecio(e) {
    const { value, isConfirmed } = await sweet.fire({
        title: "Cambiar Precio",
        input: "number",
        showCancelButton: true,
        confirmButtonText: "Aceptar"
    });
    const producto = listaProductos.find(elem => elem.producto.idTabla === seleccionado.id);
    producto.producto.precio = parseFloat(value);
    seleccionado.children[3].innerText = redondear(producto.producto.precio, 2);
    seleccionado.children[4].innerText = redondear(producto.cantidad * producto.producto.precio, 2);
    calcularTotal();
};

//Calculamos el total que representa los tr
async function calcularTotal() {
    const trs = document.querySelectorAll('tbody tr');
    let aux = 0;
    for await (let tr of trs) {
        aux += parseFloat(tr.children[4].innerText);
    };

    total.value = redondear(aux, 2);
};

async function calcularEmpanadas(producto, cantidadProducto) {
    empanadas = producto.seccion?.nombre === "EMPANADAS" ? empanadas + parseFloat(cantidad.value) : empanadas;

    if (empanadas % 12 === 0 && empanadas !== 0) {
        let aux = precioEmpanadas.docena / 12;
        for await (let { cantidad, producto } of listaProductos) {
            if (producto.seccion?.nombre === "EMPANADAS") {
                producto.precio = aux;
                cambiarTr(producto.idTabla, producto.precio, cantidad)
            }
        };
        calcularTotal();
        descuentoPorDocena = false;
    } else if (empanadas === 6) {
        //Si es media docena
        let aux = precioEmpanadas.mediaDocena / 6;
        for await (let { cantidad, producto } of listaProductos) {
            if (producto.seccion?.nombre === "EMPANADAS") {
                producto.precio = aux;
                cambiarTr(producto.idTabla, producto.precio, cantidad);
            }
        };
        calcularTotal();
        descuentoPorDocena = false;

    } else if (empanadas % 12 === 6 && empanadas > 6) {
        let totalEmpanadas = 0;
        let cantDocena = 0;
        let aux = empanadas;
        while (aux > 12) {
            aux -= 12;
            cantDocena++;
        }

        for await (let { cantidad: cant, producto } of listaProductos) {
            if (producto.seccion?.nombre === "EMPANADAS") {
                producto.precio = precioEmpanadas.mediaDocena / 6;
                cambiarTr(producto.idTabla, producto.precio, cant);
                totalEmpanadas += (producto.precio * cant);
            }
            await calcularTotal();
        }
        descuentoPorDocena = true;
        total.value = (parseFloat(total.value) - totalEmpanadas + (precioEmpanadas.docena * cantDocena) + precioEmpanadas.mediaDocena).toFixed(2);
    } else {
        let empenadaDocena = empanadas;
        let empanadaIndividual = 0;
        let aux = empanadas;
        let cantDocena = 0;
        let cantMediaDocena = 0;
        let totalAux = 0;

        while (empenadaDocena % 12 !== 0 && empenadaDocena % 12 !== 6) {
            empenadaDocena--;
            empanadaIndividual++;
        };

        while (aux > 12) {
            aux -= 12;
            cantDocena++;
        }

        while (aux > 6) {
            aux -= 6;
            cantMediaDocena++;
        }


        for await (let { cantidad, producto } of listaProductos) {
            if (producto.seccion?.nombre === "EMPANADAS") {
                const { data } = await axios.get(`${URL}producto/${producto._id}`);
                if(!data.ok) return await sweet.fire('Error al obtener el producto', data.msg, 'error');

                const precio = data.producto.precio;
                producto.precio = precio;
                cambiarTr(producto.idTabla, producto.precio, cantidad);
            } else {
                totalAux += cantidad * producto.precio;
            };
        };
        await calcularTotal();

        if (empanadas > 6) {
            descuentoPorDocena = true;
        }
        total.value = redondear((cantDocena * precioEmpanadas.docena) + (cantMediaDocena * precioEmpanadas.mediaDocena) + (empanadaIndividual * producto.precio) + totalAux, 2);

    }
};

function cambiarTr(idtabla, precio, cantidad) {
    const tr = document.getElementById(idtabla);
    if (tr) {
        tr.children[3].innerText = precio.toFixed(2);
        tr.children[4].innerText = redondear(cantidad * precio, 2);
    }
};

const filtrar = async (e) => {
    let condicion = seleccion.value;

    if (condicion === "codigo") {
        condicion = "_id";
    };
    const descripcion = buscador.value !== "" ? buscador.value : "textoVacio";
    const {data} = await axios.get(`${URL}producto/forSeccionAndDescription/${descripcion}/${condicion}`);
    if(!data.ok) return await sweet.fire('Error al filtrar los productos', data.msg, 'error');
    
    listarTarjetas(data.productos);

};

const clickEnTarjetas = async (e) => {

    seleccionado && seleccionado.classList.toggle('seleccionado');

    if (e.target.classList.contains('tarjeta')) {
        seleccionado = e.target;
    } else if (e.target.nodeName === "IMG") {
        seleccionado = e.target.parentNode;
    } else if (e.target.nodeName === "H4") {
        seleccionado = e.target.parentNode;
    } else if (e.target.id === "precio") {
        seleccionado = e.target.parentNode;
    } else if (e.target.classList.contains('divBotones')) {
        seleccionado = e.target.parentNode;
    } else if (e.target.nodeName === "BUTTON") {
        seleccionado = e.target.parentNode.parentNode;
    } else if (e.target.nodeName === "SPAN") {
        seleccionado = e.target.parentNode.parentNode.parentNode.parentNode;
    };


    if (e.target.innerText === 'looks_6') {
        cantidad.value = '6.00';
    } else if (e.target.innerText === '1k') {
        cantidad.value = '12.00';
    } else {
        const { isConfirmed, value } = await sweet.fire({
            title: "Cantidad",
            input: "number",
            confirmButtonText: 'Aceptar'
        });

        if (isConfirmed && value !== '') {
            cantidad.value = value;
            listarProducto(seleccionado.id);
            return;
        } else {
            cantidad.value = '1.00';
            return;
        };
    };

    listarProducto(seleccionado.id);
};

const listarTarjetas = async (productos) => {
    seccionTarjetas.innerText = "";
    for (let producto of productos) {
        const div = document.createElement('div');
        div.classList.add('tarjeta');
        div.id = producto._id;
        div.classList.add(producto._id);

        //Div de informacion de stock y precio
        const divInformacion = document.createElement('div');
        divInformacion.classList.add('divInformacion');

        const divAuxiliar = document.createElement('div')

        const img = document.createElement('img');
        const titulo = document.createElement('h4');
        const id = document.createElement('p');

        const precio = document.createElement('p');
        const stock = document.createElement('p');

        id.id = "id"
        precio.id = "precio";
        stock.id = "stock";

        const divBotones = document.createElement('div');
        divBotones.classList.add('divBotones');

        const modificar = document.createElement('button');
        const eliminar = document.createElement('button');
        const agregar = document.createElement('button');
        const x6 = document.createElement('button');
        const x12 = document.createElement('button');

        const bottonModifcar = `<div id=edit class=tool><span id=edit class=material-icons>edit</span><p class=tooltip>Modificar</p></div>`;
        const bottonEliminar = `<div id=delete class=tool><span id=delete class=material-icons>delete</span><p class=tooltip>Eliminar</p></div>`;
        const bottonAgregar = `<div id=add class=tool><span id=add class=material-icons>add_shopping_cart</span><p class=tooltip>Agregar Carrito</p></div>`;
        const botonX6 = `<div id=restar class=tool>
                            <span id=add class=material-icons>looks_6</span><p class=tooltip>Media Docena</p>
                        </div>`
        const botonX12 = `<div id=restar class=tool>
                            <span id=add class=material-icons>1k</span><p class=tooltip>Docena</p>
                        </div>`

        img.setAttribute('src', `${URL}img/${producto._id}.png`);
        img.setAttribute('alt', producto.descripcion);

        titulo.innerText = producto.descripcion;
        id.innerText = "Codigo: " + producto._id;
        precio.innerText = "$" + producto.precio.toFixed(2);
        stock.innerText = producto.stock.toFixed(2);
        modificar.innerHTML = (bottonModifcar);
        eliminar.innerHTML = (bottonEliminar);
        agregar.innerHTML = (bottonAgregar);
        x6.innerHTML = (botonX6);
        x12.innerHTML = (botonX12);

        divInformacion.innerHTML = `
            <div>
                <p>Precio:</p>
                <p id=precio>${precio.innerHTML}</p>
            </div>
            <div>
                <p>Stock:</p>
                <p id=stock>${stock.innerHTML}</p>
            </div>
        `;
        divBotones.appendChild(agregar);
        producto.seccion?.nombre === "EMPANADAS" && divBotones.appendChild(x6);
        producto.seccion?.nombre === "EMPANADAS" && divBotones.appendChild(x12);

        div.appendChild(img);
        div.appendChild(titulo);
        div.appendChild(id);
        div.appendChild(divInformacion);
        div.appendChild(divBotones);

        seccionTarjetas.appendChild(div);
    }
};

buscador.addEventListener('keyup', filtrar);
seccionTarjetas.addEventListener('click', clickEnTarjetas);


