require('dotenv').config();
const { ipcRenderer } = require('electron');
const { apretarEnter, redondear, cargarFactura, ponerNumero, verCodigoComprobante, verTipoComprobante, verSiHayInternet, getParameterByName, verCodigoDocumento } = require('../helpers');

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

//Carrito
const manual = document.getElementById('manual');
const limpiar = document.getElementById('limpiar');
const divCarrito = document.getElementById('divCarrito');
const observaciones = document.getElementById('observaciones');
const efectivo = document.getElementById('efectivo');
const tarjetaCredito = document.getElementById('tarjetaCredito');
const total = document.querySelector('#total');
const precioTotal = document.querySelector('#precioTotal');

//Parte Producto
const secciones = document.querySelector('.secciones');

//parte totales
const radio = document.querySelectorAll('input[name="condicion"]');

//botones
const facturar = document.getElementById('facturar');
const volver = document.querySelector('.volver');

//alerta
const alerta = document.querySelector('.alerta');

//body
const body = document.querySelector('body');

//Modal
const modal = document.getElementById('modal');
const descripcionProducto = document.getElementById('descripcionProducto');
const precioProducto = document.getElementById('precioProducto');
const impuestoProducto = document.getElementById('impuestoProducto');
const aceptar = document.getElementById('aceptar');


let tipoFactura = getParameterByName("tipoFactura");
let facturaAnterior;

let situacion = "blanco";
let listaProductos = [];
let carrito = {
    productos: []
};
let tipoPago = '';

let seccionActivo;

//Empanadas
let precioEmpanadas = 0;
let empanadas = 0;
let descuentoPorDocena = false; //Se usa para que en el ticket si esto es true se muetre un texto que diga que se hizo un descuento por una docena y media

const abrirModal = () => {
    modal.classList.remove('none');
};

const agregarItemCarrito = (e) => {
    const item = carrito.productos.findIndex(producto => producto.producto._id == e.target.id);
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


    listarProductos(carrito.productos)
};

const agregarMediaDocena = (e) => {
    const item = carrito.productos.findIndex(producto => producto.producto._id === e.target.id);
    
    if(item === -1){
        const producto = listaProductos.find(elem => elem._id === e.target.id);
        carrito.productos.push({
            cantidad: 6,
            producto: producto,
            observaciones: ''
        });
    }else{
        carrito.productos[item].cantidad += 6;
    }

    listarProductos(carrito.productos)
};

const agregarDocena = (e) => {
    const item = carrito.productos.findIndex(producto => producto.producto._id === e.target.id);
    
    if(item === -1){
        const producto = listaProductos.find(elem => elem._id === e.target.id);
        carrito.productos.push({
            cantidad: 12,
            producto: producto,
            observaciones: ''
        });
    }else{
        carrito.productos[item].cantidad += 12;
    }

    listarProductos(carrito.productos)
}

const agregarProductoManual = () => {
    const producto = {
        _id: new Date().getTime(),
        descripcion: descripcionProducto.value,
        precio: parseFloat(precioProducto.value),
        impuesto: parseFloat(impuestoProducto.value)
    };

    carrito.productos.push({
        cantidad: 1,
        producto,
        observaciones: ''
    });

    descripcionProducto.value = '';
    precioProducto.value = '';
    modal.classList.add('none');
    listarProductos(carrito.productos);

    
};

const calcularTotal = async() => {
    let total = 0;

    let cantidadEmapandas = 0;

    for(let item of carrito.productos){
        if(item.producto?.seccion?.nombre === 'EMPANADAS'){
            cantidadEmapandas += item.cantidad;
        }else{
            total += item.producto.precio * item.cantidad
        }
    };


    if(cantidadEmapandas > 0){
        let docenas = Math.floor(cantidadEmapandas / 12);
        let resto = cantidadEmapandas % 12;

        let medias = Math.floor(resto / 6);
        let sueltas = resto % 6;

        total += (docenas * precioEmpanadas.docena) + (medias * precioEmpanadas.mediaDocena) + (sueltas * 2000); 
    };
    
    precioTotal.innerText = redondear(total, 2);
};

//Lo usamos para mostrar o ocultar cuestiones que tiene que ver con las ventas
const cambiarSituacion = (situacion) => {
    situacion === "negro" ? tarjetaCredito.classList.add('none') : tarjetaCredito.classList.remove('none');
};

const clickEnCarrito = async(e) => {
    if(e.target.id === 'limpiarProductoCarrito'){
        const elemento = e.target.parentNode.parentNode.parentNode;
        const id = elemento.id;

        quitarElemento(id);
        elemento.parentNode.remove();
    };


    if(e.target.id === 'sumar'){
        const elemento = e.target.parentNode.parentNode.parentNode;
        const id = elemento.id;

        sumarElemento(id);
    }

    if(e.target.id === 'restar'){
        const elemento = e.target.parentNode.parentNode.parentNode;
        const id = elemento.id;

        restarElemento(id);
    }
};

const clickModal = async(e) => {
    if(e.target.classList.contains('cerrarModal')){
        modal.classList.add('none');
    }
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

const limpiarCarrito = () => {
    carrito.productos = [];
    listarProductos(carrito.productos);
};

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

const listarProductos = (lista) => {

    divCarrito.innerHTML = '';

    if(lista.length === 0){
        total.classList.add('none');
        divCarrito.innerHTML = `
            <div class="flex w-full justify-center">
                <p>El Carrito esta Vacio</p>
            </div>`
            return
    }


    let div = document.createElement('div');
    
    for(let {cantidad, producto, observaciones} of lista){
        div.innerHTML += `
            <div class='flex gap-2' id='tarjetaCarrito'>
                <div class='w-20 h-10'>
                    <img class='w-full' src=${URL}img/${producto._id}.png alt=${producto.descripcion} />
                    <span class='text-muted-foreground'>${producto._id}</span>
                </div>
                
                <div class='flex flex-col flex-1' id='${producto._id}'>
                    <h4 class='m-0 text-xs font-semibold text-balance'>${producto.descripcion}</h4>
                    <span class='text-primary  font-semibold'>$ ${producto.precio.toFixed(2)}</span>

                    <div class='flex justify-between  mt-auto'>

                        <div class='flex gap-2 items-center' >
                            <button id='restar'>-</button>
                            <span>${cantidad}</span>
                            <button id='sumar'>+</button>
                            <span class='text-destructive' id='limpiarProductoCarrito'>x</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    };

    total.classList.remove('none');
    calcularTotal();
    
    divCarrito.appendChild(div);
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
        const x6 = document.createElement('button');
        const x12 = document.createElement('button');

        agregar.classList.add('boton');
        x6.classList.add('boton');
        x12.classList.add('boton');

        img.setAttribute('src', `${URL}img/${producto._id}.png`);
        img.setAttribute('alt', producto.descripcion);;

        titulo.innerText = producto.descripcion;
        stock.innerText = producto.stock.toFixed(2);

        codigo.innerText = producto._id;
        precio.innerText = "$" + producto.precio.toFixed(2);

        agregar.innerText = 'Agregar';
        x6.innerText = 'X6';
        x12.innerText = 'X12';

        agregar.id = producto._id;
        x6.id = producto._id;
        x12.id = producto._id;

        agregar.addEventListener('click', agregarItemCarrito);
        x6.addEventListener('click', agregarMediaDocena);
        x12.addEventListener('click', agregarDocena)

        divBotones.appendChild(agregar);
        producto.seccion?.nombre === "EMPANADAS" && divBotones.appendChild(x6);
        producto.seccion?.nombre === "EMPANADAS" && divBotones.appendChild(x12);

        divBotones.classList.add('flex', 'gap-2')

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

const quitarElemento = (id) => {
    carrito.productos = carrito.productos.filter(elem => elem.producto._id !== id);
    calcularTotal();
};

const restarElemento = (id) => {
    const index = carrito.productos.findIndex(elem => elem.producto._id == id);
    carrito.productos[index].cantidad -= 1;

    carrito.productos = carrito.productos.filter(elem => elem.cantidad !== 0);

    listarProductos(carrito.productos);
};

const setRubroActivo = (e) => {
    seccionActivo.classList.remove('rubroActivo');
    seccionActivo = e.target;
    seccionActivo.classList.add('rubroActivo');

    seccionActivo.innerText === 'TODOS'
        ? listarTarjetas(listaProductos)
        : listarTarjetas(listaProductos.filter(producto => producto.seccion?.nombre === seccionActivo.innerText));
};

const sumarElemento = (id) => {
    const index = carrito.productos.findIndex(elem => elem.producto._id == id);
    carrito.productos[index].cantidad += 1;

    listarProductos(carrito.productos);
};

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

aceptar.addEventListener('click', agregarProductoManual )

buscarProducto.addEventListener('keyup', filtrar);

divCarrito.addEventListener('click', clickEnCarrito);

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

efectivo.addEventListener('click', () => {
    tipoPago = 'EFECTIVO';
    tarjetaCredito.classList.remove('tipoPagoSeleccionado');
    efectivo.classList.add('tipoPagoSeleccionado');
});

tarjetaCredito.addEventListener('click', () => {
    tipoPago = 'TARJETA';
    efectivo.classList.remove('tipoPagoSeleccionado');
    tarjetaCredito.classList.add('tipoPagoSeleccionado');
});

facturar.addEventListener('click', async e => {
    //Verificamos los datos para la venta si estan correctos
    if(!verificarDatosParaventa()) return;
    
    alerta.classList.remove('none');
    
    const venta = {};

    venta.cliente = nombre.value;
    venta.idCliente = codigo.value;
    venta.direccion = direccion.value;
    venta.telefono = telefono.value;
    venta.precio = parseFloat(precioTotal.innerText);
    venta.tipo_venta = 'CD';
    venta.dispositivo = 'DESKTOP';
    venta.listaProductos = carrito.productos;
    venta.num_doc = cuit.value !== "" ? cuit.value : "00000000";
    venta.cod_doc = await verCodigoDocumento(cuit.value);
    venta.condicionIva = condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value
    venta.observaciones = observaciones.value

     //Ponemos propiedades para la factura electronica
    venta.cod_comp = situacion === "blanco" ? await verCodigoComprobante(tipoFactura, cuit.value, condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value) : 0;
    venta.tipo_comp = situacion === "blanco" ? await verTipoComprobante(venta.cod_comp) : "Comprobante";

    const [iva21, iva0, gravado21, gravado0, iva105, gravado105, cantIva] = await sacarIva(carrito.productos); //  acamos el iva de los productos
    venta.iva21 = iva21;
    venta.iva0 = iva0;
    venta.gravado0 = gravado0;
    venta.gravado21 = gravado21;
    venta.iva105 = iva105;
    venta.gravado105 = gravado105;
    venta.cantIva = cantIva;
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

    if(tipoPago === ''){
        return await sweet.fire('No se puede generar la venta', 'Elegir el metodo de pago', 'error')
    }

    return true;
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

manual.addEventListener('click', abrirModal);
limpiar.addEventListener('click', limpiarCarrito);

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

document.addEventListener('dblclick', () => {
    situacion = situacion === 'blanco' ? 'negro' : 'blanco';
    body.classList.toggle('negro');
    cambiarSituacion(situacion);
});

modal.addEventListener('click', clickModal);

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

cuit.addEventListener('focus', e => {
    cuit.select();
});

ipcRenderer.on('recibir', (e, args) => {
    const { tipo, informacion} = JSON.parse(args);
    tipo === "cliente" && listarCliente(informacion);
    tipo === "Ningun cliente" && nombre.focus();
});

//ponemos un numero para la venta y luego mandamos a imprimirla
ipcRenderer.on('poner-numero', async (e, args) => {
    ponerNumero();
});