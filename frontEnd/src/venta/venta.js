function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const sweet = require('sweetalert2');
const { ipcRenderer } = require('electron');

let vendedor = getParameterByName('vendedor');
const {apretarEnter,redondear,cargarFactura, ponerNumero, verCodigoComprobante, verTipoComprobante, verSiHayInternet} = require('../helpers');
const archivo = require('../configuracion.json');

//Parte Cliente
const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const telefono = document.querySelector('#telefono');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const cuit = document.querySelector('#cuit');
const condicionIva = document.querySelector('#condicion');

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
let totalGlobal = 0;
let idProducto = 0;
let situacion = "blanco";
let porcentajeH = 0;
let descuento = 0;
let listaProductos = [];
let pedido;

//Por defecto ponemos el A Consumidor Final y tambien el select
window.addEventListener('load',async e=>{

    if (tipoFactura === "notaCredito") {

        await sweet.fire({
            title:"Numero de Factura Anterior",
            input:"text",
            confirmButtonText:"Aceptar",
            showCancelButton:true
        }).then(({isConfirmed,value})=>{
            console.log(isConfirmed)
            if (isConfirmed) {
                facturaAnterior = value.padStart(8,'0');
            }else{
                location.href = '../menu.html';
            }
        });
    }
    
    listarCliente(1);//listanos los clientes
});

document.addEventListener('keydown',e=>{
    if (e.keyCode === 18) {
        document.addEventListener('keydown',event=>{
            if (event.keyCode === 120) {
                body.classList.toggle('negro');
                situacion = situacion === "negro" ? "blanco" : "negro";
                cambiarSituacion(situacion);
            }
        },{once:true})
    }else if(e.keyCode === 113){
        const opciones = {
            path:"clientes/agregarCliente.html",
            ancho: 900,
            altura: 600
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }else if(e.keyCode === 114){
        const opciones = {
            path:"productos/agregarProducto.html",
            ancho:900,
            altura:650
        };
        ipcRenderer.send('abrir-ventana',opciones);
    }else if(e.keyCode === 115){
        const opciones = {
            path: "productos/cambio.html",
            ancho:1000,
            altura:550,
        }
        ipcRenderer.send('abrir-ventana',opciones); 
    }else if(e.keyCode === 116){
        const opciones = {
            path:"gastos/gastos.html",
            ancho:500,
            altura:400
        }
        ipcRenderer.send('abrir-ventana',opciones);   
    }else if(e.keyCode === 117){
        impresion.checked = !impresion.checked;
    }
});

//Buscamos un cliente, si sabemos el codigo directamente apretamos enter
codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        if (codigo.value === "") {
            const opciones = {
                path: './clientes/clientes.html',
                botones:false,
            }
            ipcRenderer.send('abrir-ventana',opciones)
        }else{
            listarCliente(codigo.value)
        }
    }
});

codBarra.addEventListener('keypress',async e=>{
    if(e.key === "Enter" && codBarra.value !== "" && codBarra.value !== "0"){
        cantidad.focus();
    }else if(e.key === "Enter" && codBarra.value === ""){
        //Esto abre una ventana donde lista todos los productos
        const opciones = {
            path: "./productos/productos.html",
            botones: false
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }else if(codBarra.value === "0"){
        cantidad.focus();
    }

    if(e.keyCode === 37){
        cantidad.focus();
    }
});

descripcion.addEventListener('keypress',e=>{
    if (e.keyCode === 13) {
        precioU.focus();
    }
});

precioU.addEventListener('keypress',async e=>{
    if ((e.key === "Enter")) {
        if (precioU.value !== "") {
            crearProducto();
            // rubro.focus();   
        }else{
            await sweet.fire({
                title:"Poner un precio al Producto",
            });
        }
    }
});

const crearProducto = ()=>{
    idProducto++;
    const producto = {
        descripcion:descripcion.value.toUpperCase(),
        precio: parseFloat(precioU.value),
        idTabla:`${idProducto}`,
        impuesto:0,
        productoCreado:true
    };

    listaProductos.push({cantidad:parseFloat(cantidad.value),producto});
        tbody.innerHTML += `
        <tr id=${idProducto}>
            <td></td>
            <td>${cantidad.value}</td>
            <td>${descripcion.value.toUpperCase()}</td>
            <td>${parseFloat(producto.precio).toFixed(2)}</td>
            <td>${redondear((producto.precio * parseFloat(cantidad.value)),2)}</td>
            <td class=acciones>
                <div class=tool>
                    <span class=material-icons>delete</span>
                    <p class=tooltip>Eliminar</p>
                </div>
            </td>
        </tr>
    `;
    tbody.scrollIntoView({
        block:"end"
    });

    total.value = redondear((parseFloat(total.value) + parseFloat(producto.precio) * parseFloat(cantidad.value)),2);
    totalGlobal = parseFloat(total.value);
    cantidad.value = "1.00";
    codBarra.value = "";
    precioU.value = "";
    descripcion.value = "";
    codBarra.focus();
};

ipcRenderer.on('recibir',(e,args)=>{
    const {tipo ,informacion,cantidad:cant,descripcion:desc} = JSON.parse(args);
    tipo === "cliente" && listarCliente(informacion);
    tipo === "producto" && (codBarra.value = informacion);
    tipo === "producto" && (cantidad.value = cant);
    tipo === "producto" && (descripcion.value = desc);
    tipo === "producto" && listarProducto(codBarra.value);
    tipo === "Ningun cliente" && nombre.focus();
});

//Vemos que input tipo radio esta seleccionado
const verTipoVenta = ()=>{
    let retornar;
    radio.forEach(input =>{
        if (input.checked) {
            retornar = input.value;
        }
    });
    return retornar;
};

facturar.addEventListener('click',async e=>{
    if (codigo.value === "") {
        sweet.fire({
            title:"Poner un codigo de cliente"
        });
    }else if(!verSiHayInternet() && situacion === "blanco"){
        await sweet.fire({
            title:"No se puede hacer la factura porque no hay internet"
        })
    }else if(cuit.value.length === 8 && condicionIva.value === "Responsable Inscripto" && archivo.condIva === "Inscripto"){
        if (tipoFactura) {
            await sweet.fire({
                title:"No se puede hacer Nota Credito B a un Inscripto"
            });
        }else{
            await sweet.fire({
                title:"No se puede hacer Factura B a un Inscripto"
            });
        }
    }else{
        alerta.classList.remove('none');
        let numeros;
        await ipcRenderer.invoke('gets-numeros').then((result)=>{
            numeros = JSON.parse(result);
        });
        const venta = {};

        venta.cliente = nombre.value;
        venta.fecha = new Date();
        venta.idCliente = codigo.value;
        venta.precio = parseFloat(total.value);
        venta.descuento = descuento;
        venta.tipo_venta = await verTipoVenta();
        venta.listaProductos = listaProductos;
        
        //Ponemos propiedades para la factura electronica
        venta.cod_comp = situacion === "blanco" ? await verCodigoComprobante(tipoFactura,cuit.value,condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value) : 0;
        venta.tipo_comp = situacion === "blanco" ? await verTipoComprobante(venta.cod_comp) : "Comprobante";
        venta.num_doc = cuit.value !== "" ? cuit.value : "00000000";
        venta.cod_doc = await verCodigoDocumento(cuit.value);
        venta.condicionIva = condicionIva.value === "Responsable Inscripto" ? "Inscripto" : condicionIva.value
        const [iva21,iva0,gravado21,gravado0,iva105,gravado105,cantIva] = await sacarIva(listaProductos); //sacamos el iva de los productos
        venta.iva21 = iva21;
        venta.iva0 = iva0;
        venta.gravado0 = gravado0;
        venta.gravado21 = gravado21;
        venta.iva105 = iva105;
        venta.gravado105 = gravado105;
        venta.cantIva = cantIva;
        venta.direccion = direccion.value;

        await ipcRenderer.invoke('get-numero-pedido').then((result)=>{
            pedido = JSON.parse(result)
            venta.nPedido = JSON.parse(result).numero + 1; 
            pedido.numero = venta.nPedido;
        });

        await ipcRenderer.send('put-pedido',pedido);
        venta.caja = require('../configuracion.json').caja; //vemos en que caja se hizo la venta
        // venta.vendedor = vendedor ? vendedor : "";
        
        venta.facturaAnterior = facturaAnterior ? facturaAnterior : "";
        if (venta.tipo_venta === "CC") {
            venta.numero = numeros["Cuenta Corriente"] + 1;
        }else if(venta.tipo_venta === "PP"){
            venta.numero = numeros["Presupuesto"] + 1;
        }else if(venta.tipo_venta === "CD" || venta.tipo_venta === "T"){
            venta.numero = numeros["Contado"] + 1;
        };

        if (venta.tipo_venta === "CC") {
            await ipcRenderer.send('put-numeros',["Cuenta Corriente",venta.numero]);
            // await axios.put(`${URL}numero/Cuenta Corriente`,{"Cuenta Corriente":venta.numero});
        }else if(venta.tipo_venta === "PP"){
            await ipcRenderer.send('put-numeros',["Presupuesto",venta.numero]);
            // await axios.put(`${URL}numero/Presupuesto`,{"Presupuesto":venta.numero});
        }else{
            await ipcRenderer.send('put-numeros',["Contado",venta.numero]);
            // await axios.put(`${URL}numero/Contado`,{Contado:venta.numero});
        }
        try {
            if (situacion === "blanco") {
                alerta.classList.remove('none');
                venta.afip = await cargarFactura(venta,facturaAnterior ? true : false);
                venta.F = true;
            }else{
                venta.F = false;
                alerta.children[1].innerHTML = "Generando Venta";
            }

            for (let producto of listaProductos){
                await cargarMovimiento(producto,venta.numero,venta.cliente,venta.tipo_venta,venta.tipo_comp,venta.caja,venta.vendedor);
                if (!(producto.producto.productoCreado)) {
                    await descontarStock(producto);
                }
                //producto.producto.precio = producto.producto.precio - redondear((parseFloat(descuentoPor.value) * producto.producto.precio / 100,2));
            }
            venta.tipo_venta !== "PP" && await ipcRenderer.send('descontar-stock',descuentoStock);

            // venta.tipo_venta !== "PP" && await axios.put(`${URL}productos/descontarStock`,descuentoStock)
            // venta.tipo_venta !== "PP" && await axios.post(`${URL}movimiento`,movimientos);
            //sumamos al cliente el saldo y agregamos la venta a la lista de venta
            venta.tipo_venta === "CC" && await sumarSaldo(venta.idCliente,venta.precio,venta.numero);


            //Ponemos en la cuenta conpensada si es CC
            venta.tipo_venta === "CC" && await ponerEnCuentaCompensada(venta);
            venta.tipo_venta === "CC" && await ponerEnCuentaHistorica(venta,parseFloat(saldo.value));

            if (venta.tipo_venta === "CC" &&  parseFloat(inputRecibo.value) !== 0) {
                await hacerRecibo(numeros.Recibo);
            }
        
            let cliente = {};
            cliente.nombre = nombre.value.toUpperCase();
            cliente.cuit = cuit.value;
            cliente.direccion = direccion.value.toUpperCase();
            cliente.telefono = telefono.value;

            if (venta.tipo_venta === "PP") {
                // await axios.post(`${URL}Presupuesto`,venta);
            }else{
                ipcRenderer.send('post-venta',venta);
            }

            if (impresion.checked) {
                ipcRenderer.send('imprimir-comanda',[venta,cliente,movimientos]);

                await sweet.fire({
                    title:"Imprimir Ticket Cliente",
                    confirmButtonText:"Aceptar",
                    showCancelButton:true
                }).then(({isConfirmed})=>{
                    if (isConfirmed) {
                        ipcRenderer.send('imprimir',[venta,cliente,movimientos]);
                    }
                });
            }

            location.reload();  
        } catch (error) {      
            await sweet.fire({
                title:"No se pudo generar la venta"
            });
            console.log(error)
        }finally{
            alerta.classList.add('none');
        }
    }
})

//Lo que hacemos es listar el cliente traido
const listarCliente = async(id)=>{
    codigo.value = id;
    let cliente;
    await ipcRenderer.invoke('get-cliente',id).then((result) =>{
        cliente = JSON.parse(result);
    });
    if (cliente !== "") {
        nombre.value = cliente.nombre;
        saldo.value = cliente.saldo;
        telefono.value = cliente.telefono;
        localidad.value = cliente.localidad;
        direccion.value = cliente.direccion;
        cuit.value = cliente.cuit === "" ? "00000000" : cliente.cuit;
        condicionIva.value = cliente.condicionIva ? cliente.condicionIva : "Consumidor Final";
        codBarra.focus();
        // cliente.condicionFacturacion === 1 ? cuentaCorrientediv.classList.remove('none') : cuentaCorrientediv.classList.add('none')
    }else{
        codigo.value = "";
        codigo.focus();
    }
};

//creamos la cuenta compensada cuedo la venta se hace en cuenta corriente
const ponerEnCuentaCompensada = async(venta)=>{
    const cuenta = {};
    cuenta.cliente = venta.cliente;
    cuenta.idCliente = venta.idCliente;
    cuenta.nro_venta = venta.numero;
    cuenta.importe = venta.precio;
    cuenta.pagado = inputRecibo.value;
    cuenta.tipo_comp = venta.tipo_comp;
    cuenta.saldo = venta.precio - parseFloat(inputRecibo.value);
    await axios.post(`${URL}compensada`,cuenta);
};

const ponerEnCuentaHistorica = async(venta,saldo)=>{
    const cuenta = {};
    cuenta.cliente = venta.cliente;
    cuenta.idCliente = venta.idCliente;
    cuenta.nro_venta = venta.numero;
    cuenta.tipo_comp = venta.tipo_comp;
    cuenta.debe = venta.precio;
    cuenta.saldo = facturaAnterior ? saldo - venta.precio : venta.precio + saldo;
    (await axios.post(`${URL}historica`,cuenta)).data;
}

//Cargamos el movimiento de producto a la BD
const cargarMovimiento = async({cantidad,producto,observaciones},numero,cliente,tipo_venta,tipo_comp,caja,vendedor="")=>{
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

//Descontamos el stock
const descontarStock = async({cantidad,producto})=>{
    delete producto.idTabla;
    if (facturaAnterior) {
        producto.stock += cantidad;
    }else{
        producto.stock -= cantidad;
    }
    descuentoStock.push(producto)
}

//Lo que hacemos es listar el producto traido
const listarProducto =async(id)=>{
    let producto;
    await ipcRenderer.invoke('get-producto',id).then((result)=>{
        producto = JSON.parse(result);
    });

    if (producto) {
       const productoYaUsado = listaProductos.find(({producto: product})=>{
           if (product._id === producto._id) {
               return product
           };
        });
        if(producto !== "" && !productoYaUsado){
            console.log(producto)
        if (producto.stock === 0 && archivo.stockNegativo) {
            await sweet.fire({
                title:"Producto con Stock en 0"
            });
        };
        if (producto.stock - (parseFloat(cantidad.value)) < 0 && archivo.stockNegativo) {
            await sweet.fire({
                title:"Producto con Stock menor a 0",
            });
        }
        listaProductos.push({cantidad:parseFloat(cantidad.value),producto});
        codBarra.value = producto._id;
        precioU.value = redondear(producto.precio,2);
        idProducto++;
        producto.idTabla = `${idProducto}`;
        tbody.innerHTML += `
        <tr id=${producto.idTabla}>
            <td>${codBarra.value}</td>
            <td>${parseFloat(cantidad.value).toFixed(2)}</td>
            <td>${producto.descripcion.toUpperCase()}</td>
            <td>${parseFloat(precioU.value).toFixed(2)}</td>
            <td>${redondear(parseFloat(precioU.value) * parseFloat(cantidad.value),2)}</td>
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
        block:"end"
    });
        total.value = redondear(parseFloat(total.value) + (parseFloat(cantidad.value) * parseFloat(precioU.value)),2);
        totalGlobal = parseFloat(total.value);
        }else if(producto !== "" && productoYaUsado){
            productoYaUsado.cantidad += parseFloat(cantidad.value);
            producto.idTabla = productoYaUsado.producto.idTabla;
            const tr = document.getElementById(producto.idTabla);
            tr.children[1].innerHTML = redondear(parseFloat(tr.children[1].innerHTML) + parseFloat(cantidad.value),2);
            tr.children[4].innerHTML = redondear(parseFloat(tr.children[1].innerHTML) * producto.precio,2);
            total.value = redondear(parseFloat(total.value) + (parseFloat(cantidad.value) * producto.precio),2);
            totalGlobal = parseFloat(total.value);
        }
        cantidad.value = "1.00";
        codBarra.value = "";
        descripcion.value = "";
        precioU.value = "";
        codBarra.focus();  
    }else{
        descripcion.focus();
    }
        

};

let seleccionado;
//Hacemos para que se seleccione un tr

tbody.addEventListener('click',async e=>{
    seleccionado && seleccionado.classList.remove('seleccionado');
    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "DIV"){
        seleccionado = e.target.parentNode.parentNode;
    }else if(e.target.nodeName === "SPAN"){
        seleccionado = e.target.parentNode.parentNode.parentNode;
    }
    seleccionado.classList.add('seleccionado');
    if(e.target.innerHTML === "delete"){
        sweet.fire({
            title:"Borrar?",
            confirmButtonText:"Aceptar",
            showCancelButton:true
        }).then(({isConfirmed})=>{
            if (isConfirmed) {
                tbody.removeChild(seleccionado);
                total.value = redondear(parseFloat(total.value) - parseFloat(seleccionado.children[4].innerHTML),2);
                totalGlobal = parseFloat(total.value);
                const productoABorrar = listaProductos.findIndex(({producto,cantidad})=>seleccionado.id === producto.idTabla);
                listaProductos.splice(productoABorrar,1);
            }
        });
    }else if(e.target.innerText === "edit"){
        cambiarPrecio();
    }else if(e.target.innerText === "manage_search"){
        const producto = listaProductos.find(producto => producto.producto.idTabla === seleccionado.id);

        const observaciones = await sweet.fire({
            title:"Agregar Obseraciones",
            input:'textarea',
            inputValue:producto.observaciones ? producto.observaciones : ""
        });
        producto.observaciones = observaciones.value ? observaciones.value : producto.observaciones;
        console.log(producto)
    }
});

const sumarSaldo = async(id,nuevoSaldo,venta)=>{
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    cliente.listaVentas.push(venta);
    if (facturaAnterior) {
        cliente.saldo = (cliente.saldo - nuevoSaldo);
    }else{
        cliente.saldo = (cliente.saldo + nuevoSaldo - parseFloat(inputRecibo.value)).toFixed(2);
    }
    await axios.put(`${URL}clientes/id/${id}`,cliente);
};

const sacarIva = (lista) => {
    let totalIva0 = 0;
    let totalIva21= 0;
    let gravado21 = 0; 
    let gravado0 = 0;
    let totalIva105= 0;
    let gravado105 = 0;
    lista.forEach(({producto,cantidad}) =>{
        if (producto.impuesto === 21) {
            gravado21 += cantidad*producto.precio/1.21;
            totalIva21 += cantidad*producto.precio - producto.precio/1.21;
        }else if(producto.impuesto === 10.5){
            gravado105 += cantidad*producto.precio/1.105
            totalIva105 += (cantidad*producto.precio) - (producto.precio/1.105);
        }else{
            gravado0 += cantidad*producto.precio/1;
            totalIva0 += (cantidad*producto.precio)-(producto.precio/1);
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
    return [parseFloat(totalIva21.toFixed(2)),parseFloat(totalIva0.toFixed(2)),parseFloat(gravado21.toFixed(2)),parseFloat(gravado0.toFixed(2)),parseFloat(totalIva105.toFixed(2)),parseFloat(gravado105.toFixed(2)),cantIva]
};

codigo.addEventListener('focus',e=>{
    codigo.select();
});

nombre.addEventListener('focus',e=>{
    nombre.select();
});

localidad.addEventListener('focus',e=>{
    localidad.select();
});

telefono.addEventListener('focus',e=>{
    telefono.select();
});

direccion.addEventListener('focus',e=>{
    direccion.select();
});

total.addEventListener('focus',e=>{
    total.select();
});

cobrado.addEventListener('focus',e=>{
    cobrado.select();
});

cantidad.addEventListener('focus',e=>{
    cantidad.select();
});

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        
        sweet.fire({
            title: "Cancelar Venta?",
            "showCancelButton": true,
            "confirmButtonText" : "Aceptar",
            "cancelButtonText" : "Cancelar"
        }).then((result)=>{
            if (result.isConfirmed) {
                location.href = "../menu.html" ;
            }
        });
    };
});

const hacerRecibo = async(numero)=>{
    const recibo = {};
    recibo.fecha = new Date();
    recibo.cliente = nombre.value;
    recibo.idCliente = codigo.value;
    recibo.numero = numero + 1;
    recibo.precio = inputRecibo.value;
    recibo.tipo_comp = "Recibo";
    recibo.tipo_venta = "CD";
    await hacerHistoricaRecibo(recibo.numero,recibo.precio,recibo.tipo_comp);
    await axios.post(`${URL}recibo`,recibo);
    await axios.put(`${URL}numero/Recibo`,{Recibo:recibo.numero});
};

const hacerHistoricaRecibo = async(numero,haber,tipo)=>{
    const cuenta = {};
    cuenta.cliente = nombre.value;
    cuenta.idCliente = codigo.value;
    cuenta.nro_venta = numero + 1;
    cuenta.tipo = tipo;
    cuenta.haber = haber;
    cuenta.saldo = parseFloat(total.value) - parseFloat(haber)  + parseFloat(saldo.value);
    (await axios.post(`${URL}historica`,cuenta)).data;
};

//Lo usamos para mostrar o ocultar cuestiones que tiene que ver con las ventas
const cambiarSituacion = (situacion) =>{
    situacion === "negro" ? document.querySelector('#tarjeta').parentNode.classList.add('none') : document.querySelector('#tarjeta').parentNode.classList.remove('none');
}

//Ver Codigo Documento
const verCodigoDocumento = async(cuit)=>{
    if (cuit !== "00000000" && cuit !== "") {
        if (cuit.length === 8) {
            return 96
        }else{
            return 80
        }
    }

    return 99
};

//ponemos un numero para la venta y luego mandamos a imprimirla
ipcRenderer.on('poner-numero',async (e,args)=>{
    ponerNumero();
})

nombre.addEventListener('keypress',e=>{
    apretarEnter(e,cuit);
});

cuit.addEventListener('keypress',e=>{
    apretarEnter(e,telefono);
});

telefono.addEventListener('keypress',e=>{
    apretarEnter(e,localidad);
});

localidad.addEventListener('keypress',e=>{
    apretarEnter(e,direccion);
});

direccion.addEventListener('keypress',e=>{
    apretarEnter(e,condicionIva);
});

condicionIva.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,codBarra);
});

cantidad.addEventListener('keypress',async e=>{
    if (e.keyCode === 13) {
        listarProducto(codBarra.value);
    }
});

cantidad.addEventListener('keydown',e=>{
    if(e.keyCode === 39){
        codBarra.focus();
    }
});

cobrado.addEventListener('keyup',(e)=>{
    vuelto.value = redondear(parseFloat(cobrado.value) - parseFloat(total.value),2);
});

//selects
cuit.addEventListener('focus',e=>{
    cuit.select();
});

volver.addEventListener('click',()=>{
    location.href = "../menu.html";
});

//Cambiamos los precios si elegimos
tbody.addEventListener('dblclick',cambiarPrecio);

async function cambiarPrecio(e) {
    const {value,isConfirmed} = await sweet.fire({
        title:"Cambiar Precio",
        input:"number",
        showCancelButton:true,
        confirmButtonText:"Aceptar"
    });
    const producto = listaProductos.find(elem => elem.producto.idTabla === seleccionado.id);
    producto.producto.precio = parseFloat(value);
    seleccionado.children[3].innerText = redondear(producto.producto.precio,2);
    seleccionado.children[4].innerText = redondear(producto.cantidad * producto.producto.precio,2);
    calcularTotal();
};

async function calcularTotal() {
    const trs = document.querySelectorAll('tbody tr');
    let aux = 0;
    for await(let tr of trs){
        aux += parseFloat(tr.children[4].innerText);
    };

    total.value = redondear(aux,2);
};