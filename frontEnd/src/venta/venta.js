require('dotenv').config();
const { ipcRenderer } = require('electron');
const { apretarEnter, redondear, cargarFactura, ponerNumero, verCodigoComprobante, verTipoComprobante, verSiHayInternet, getParameterByName } = require('../helpers');

const sweet = require('sweetalert2');
const axios = require('axios');
const archivo = require('../configuracion.json');

const URL = process.env.ROTISERIA_URL;


//Parte Cliente
const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const telefono = document.querySelector('#telefono');
const direccion = document.querySelector('#direccion');
const cuit = document.querySelector('#cuit');
const condicionIva = document.querySelector('#condicionIva');

//parte Buscador
const buscarProducto = document.getElementById('buscarProducto');
const seccionTarjetas = document.querySelector('.tarjetas');

//Parte Producto
const cantidad = document.querySelector('#cantidad');
const codBarra = document.querySelector('#cod-barra')
const precioU = document.querySelector('#precio-U');
const rubro = document.querySelector('#rubro');
const tbody = document.querySelector('.tbody');
const secciones = document.querySelector('.secciones');

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

let situacion = "blanco";
let listaProductos = [];
let carrito = {
    productos: []
};

let seccionActivo;

//Empanadas
let precioEmpanadas = 0;
let empanadas = 0;
let descuentoPorDocena = false; //Se usa para que en el ticket si esto es true se muetre un texto que diga que se hizo un descuento por una docena y media

const agregarItemCarrito = (e) => {
    const item = carrito.productos.findIndex(producuto => producuto.producto._id == e.target.id);
    if(item === -1){
        const producto = listaProductos.find(elem => elem._id === e.target.id);
        carrito.productos.push({
            cantidad: 1,
            producto: producto,
            observaciones: ''
        });
    }else{
        carrito.productos[item].cantidad += 1
    };
};

const filtrar = async (e) => {
    const descripcion = buscarProducto.value !== "" ? buscarProducto.value : "textoVacio";
    try {
        const {data} = await axios.get(`${URL}producto/forSeccionAndDescription/${descripcion}/descripcion`);
        if(data.ok){
            listaProductos = data.productos;
            listarTarjetas(data.productos);
        }else{
            return await sweet.fire('Error al filtrar los productos', data.msg, 'error');  
        } 
    } catch (error) {
        return await sweet.fire('Error al filtrar los productos', data?.response?.data?.msg, 'error');  
    };
    
    

};

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
        telefono.value = cliente.telefono;
        direccion.value = cliente.direccion;
        cuit.value = cliente.cuit === "" ? "00000000" : cliente.cuit;
        condicionIva.value = cliente.condicionIva ? cliente.condicionIva : "Consumidor Final";

    } else {
        codigo.value = "";
        codigo.focus();
    }
};

const listarSecciones = (lista) => {
    
    const fragment = document.createDocumentFragment();

    for(let seccion of lista){
        const p = document.createElement('p');
        p.classList.add('rubro');

        p.innerText = seccion.nombre;

        if(seccion.nombre === 'TODOS'){
            p.classList.add('rubroActivo');
            seccionActivo = p;
        }
        p.addEventListener('click', setRubroActivo);
        fragment.appendChild(p);
    };

    secciones.appendChild(fragment)
};

const listarTarjetas = async (productos) => {
    seccionTarjetas.innerText = "";
    for (let producto of productos) {

        const div = document.createElement('div');
        div.classList.add('tarjeta');
        div.id = producto._id;
        div.classList.add(producto._id);


        const divImg = document.createElement('div')
        const img = document.createElement('img');

        divImg.classList.add('divImg')
        img.classList.add('h-10', 'w-full', 'object-contain', 'rounded-sm');

        const divInfo = document.createElement('div');
        const titulo = document.createElement('h4');
        const stock = document.createElement('p');
        divInfo.classList.add('divInfo');
        titulo.classList.add('titulo');
        stock.classList.add('stock')

        const codigo = document.createElement('span')
        const precio = document.createElement('p');


        precio.classList.add('precio');

        const divBotones = document.createElement('div');
        divBotones.classList.add('divBotones');

        const agregar = document.createElement('button');

        agregar.classList.add('boton')
        // const x6 = document.createElement('button');
        // const x12 = document.createElement('button');
        // const botonX6 = `<div id=restar class=tool>
        //                     <span id=add class=material-icons>looks_6</span><p class=tooltip>Media Docena</p>
        //                 </div>`
        // const botonX12 = `<div id=restar class=tool>
        //                     <span id=add class=material-icons>1k</span><p class=tooltip>Docena</p>
        //                 </div>`

        img.setAttribute('src', `${URL}img/${producto._id}.png`);
        img.setAttribute('alt', producto.descripcion);

        titulo.innerText = producto.descripcion;
        stock.innerText = producto.stock.toFixed(2);


        codigo.innerText = producto._id;
        precio.innerText = "$" + producto.precio.toFixed(2);

        agregar.innerText = 'Agregar';
        agregar.id = producto._id;
        agregar.addEventListener('click', agregarItemCarrito);
        // x6.innerHTML = (botonX6);
        // x12.innerHTML = (botonX12);

        divBotones.appendChild(agregar);
        // producto.seccion?.nombre === "EMPANADAS" && divBotones.appendChild(x6);
        // producto.seccion?.nombre === "EMPANADAS" && divBotones.appendChild(x12);

        divImg.appendChild(img);
        divInfo.appendChild(titulo);
        divInfo.appendChild(stock);

        div.appendChild(divImg);
        div.appendChild(divInfo);
        div.appendChild(codigo);
        div.appendChild(precio);
        div.appendChild(divBotones);

        seccionTarjetas.appendChild(div);
        
    }
};

const setRubroActivo = (e) => {
    seccionActivo.classList.remove('rubroActivo');
    seccionActivo = e.target;
    seccionActivo.classList.add('rubroActivo');

    seccionActivo.innerText === 'TODOS'
        ? listarTarjetas(listaProductos)
        : listarTarjetas(listaProductos.filter(producto => producto.seccion.nombre === seccionActivo.innerText));
};

//Por defecto ponemos el A Consumidor Final y tambien el select
window.addEventListener('load', async e => {
    listarCliente(1);//listanos los clientes

    try {
        const { data } = await axios.get(`${URL}carta`);
        if(!data.ok) return await sweet.fire('No se pudo obtener la carta empanada', data.msg, 'error');

        precioEmpanadas = data.carta;
        
        filtrar();
    } catch (error) {
        console.log(error?.response?.data?.msg);
        await sweet.fire('No se pudo obtener la carta de empanada', error.response.data.msg, 'error');
    };

    try {
        const { data } = await axios.get(`${URL}seccion`);
        if(data.ok){
            listarSecciones(data.secciones)
        }else{
            return await sweet.fire('No se pudo obtener las secciones', data.msg, 'error');
        };
    } catch (error) {
        console.log(error);
    };
});

buscarProducto.addEventListener('keyup', filtrar);

document.addEventListener('keydown', e => {
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

ipcRenderer.on('recibir', (e, args) => {
    const { tipo, informacion} = JSON.parse(args);
    tipo === "cliente" && listarCliente(informacion);
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

// facturar.addEventListener('click', async e => {
//     //Verificamos los datos para la venta si estan correctos
//     if(!verificarDatosParaventa()) return;
    
//     alerta.classList.remove('none');
    
//     const venta = {};

//     venta.cliente = nombre.value;
//     venta.fecha = new Date();
//     venta.idCliente = codigo.value;
//     venta.precio = parseFloat(total.value);
//     venta.descuento = descuento;
//     venta.tipo_venta = await verTipoVenta();
//     venta.listaProductos = listaProductos;

//     //Ponemos propiedades para la factura electronica
//     venta.cod_comp = situacion === "blanco" ? await verCodigoComprobante(tipoFactura, cuit.value, condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value) : 0;
//     venta.tipo_comp = situacion === "blanco" ? await verTipoComprobante(venta.cod_comp) : "Comprobante";
//     venta.num_doc = cuit.value !== "" ? cuit.value : "00000000";
//     venta.cod_doc = await verCodigoDocumento(cuit.value);
//     venta.condicionIva = condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value
//     const [iva21, iva0, gravado21, gravado0, iva105, gravado105, cantIva] = await sacarIva(listaProductos); //sacamos el iva de los productos
//     venta.iva21 = iva21;
//     venta.iva0 = iva0;
//     venta.gravado0 = gravado0;
//     venta.gravado21 = gravado21;
//     venta.iva105 = iva105;
//     venta.gravado105 = gravado105;
//     venta.cantIva = cantIva;
//     venta.direccion = direccion.value;
//     venta.telefono = telefono.value;
//     venta.descuentoPorDocena = descuentoPorDocena;
//     venta.dispositivo = 'DESKTOP';
//     venta.caja = require('../configuracion.json').caja; //vemos en que caja se hizo la venta
    
//     venta.facturaAnterior = facturaAnterior ? facturaAnterior : "";
    
//     if (situacion === "blanco") {
//         alerta.classList.remove('none');
//         venta.afip = await cargarFactura(venta, facturaAnterior ? true : false);
//         venta.F = true;
//     } else {
//         venta.F = false;
//         alerta.children[1].innerHTML = "Generando Venta";
//     };
        

//     const {isConfirmed} = await sweet.fire({
//             title: "Imprimir Ticket Cliente",
//             confirmButtonText: "Aceptar",
//             showCancelButton: true
//     });

//     if(isConfirmed){
//         venta.imprimirCliente = true
//     }else{
//         venta.imprimirCliente = false
//     };
        
//     try {

//         const { data } = await axios.post(`${URL}venta`, venta);
//         if(!data.ok) return await sweet.fire('Error al hacer la venta', error.response.data.msg, 'error');

//         location.reload();

//     } catch (error) {

//         console.log(error.response.data.msg);
//         sweet.fire('Error al hacer la venta', error.reponse.data.msg, 'error');

//     };

//     alerta.classList.add('none')
// });

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

telefono.addEventListener('focus', e => {
    telefono.select();
});

direccion.addEventListener('focus', e => {
    direccion.select();
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


direccion.addEventListener('keypress', e => {
    apretarEnter(e, condicionIva);
});

condicionIva.addEventListener('keypress', e => {
    e.preventDefault();
    apretarEnter(e, codBarra);
});


//selects
cuit.addEventListener('focus', e => {
    cuit.select();
});

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

