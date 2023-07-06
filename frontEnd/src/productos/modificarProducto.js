const { ipcRenderer } = require('electron');
const {cerrarVentana,apretarEnter, redondear, agregarMovimientoVendedores} = require('../helpers');
const sweet = require('sweetalert2');

const archivo = require('../configuracion.json');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const codigo = document.querySelector('#codigo');
const descripcion = document.querySelector('#descripcion');
const secciones = document.querySelector('#secciones');
const provedor = document.querySelector('#provedor');
const stock = document.querySelector('#stock');
const img = document.querySelector('#img');
const textBold = document.querySelector('#textBold');
const costo = document.querySelector('#costo');
const ganancia = document.querySelector('#ganancia');
const total = document.querySelector('#total');
const modificar = document.querySelector('.modificar');
const salir = document.querySelector('.salir');

let vendedor;

//Recibimos la informacion del producto para luego llenar los inputs
ipcRenderer.on('informacion',async (e,args)=>{
    const {informacion}= args;
    let producto;
    listarSecciones();
    await ipcRenderer.invoke('get-producto',informacion).then((result)=>{
        producto = JSON.parse(result);
    });
    llenarInputs(informacion,producto);
});

//llenamos los inputs con la informacion que tenemos
const llenarInputs = async(codigoProducto,producto)=>{
    codigo.value = codigoProducto;
    descripcion.value = producto.descripcion;
    provedor.value = producto.provedor;
    stock.value = producto.stock;
    costo.value = producto.costo.toFixed(2);
    ganancia.value = producto.ganancia.toFixed(2);
    secciones.value = producto.seccion;
    total.value = producto.precio.toFixed(2);   
    textBold.checked = producto.textBold ? true : false;
}

//al hacer click modificamos los productos con el valor de los inputs
modificar.addEventListener('click',async e=>{
    let banderaImg = {
        isConfirmed:true
    };

    if (img.files[0]) {
        const imgBuffer = await sharp(img.files[0].path)
        .resize(400)
        .jpeg({ mozjpeg: true })
        .toBuffer();

        fs.writeFileSync(path.join(__dirname,'..',`imgProductos/${codigo.value}.png`),imgBuffer);
    };

    if (banderaImg) {
        const producto = {};
        producto._id = codigo.value;
        producto.descripcion = descripcion.value.trim().toUpperCase();
        producto.provedor = provedor.value.trim().toUpperCase();
        producto.stock = parseFloat(stock.value);
        producto.costo = parseFloat(costo.value);
        producto.ganancia = parseFloat(ganancia.value);
        producto.seccion = secciones.value;
        producto.precio = parseFloat(total.value);
        producto.textBold = textBold.checked ? true : false;
        producto.img = path.join(__dirname,'..',`imgProductos/${codigo.value}.png`);

        await ipcRenderer.send('put-producto',producto);    
        await ipcRenderer.send('informacion-a-ventana',producto);
        window.close();
    }
});

codigo.addEventListener('keypress',e=>{
    apretarEnter(e,descripcion);
});

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,provedor);
});

provedor.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
});

stock.addEventListener('keypress',e=>{
    apretarEnter(e,costo);
});

costo.addEventListener('keypress',e=>{
    apretarEnter(e,total)
});

ganancia.addEventListener('keypress',e=>{
    apretarEnter(e,modificar);
});

total.addEventListener('keypress',e=>{
    apretarEnter(e,ganancia);
});

descripcion.addEventListener('focus',e=>{
    descripcion.select()
});

provedor.addEventListener('focus',e=>{
    provedor.select()
});

stock.addEventListener('focus',e=>{
    stock.select()
});

costo.addEventListener('focus',e=>{
    costo.select()
});

ganancia.addEventListener('focus',e=>{
    ganancia.select();
    if (parseFloat(costo.value) === 0) {
        costo.value = total.value;
    }
    ganancia.value = redondear((parseFloat(total.value) - parseFloat(costo.value)) * 100 / parseFloat(costo.value),2);
});

total.addEventListener('focus',e=>{
    total.select();
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keydown',e=>{
    cerrarVentana(e);
});

async function listarSecciones() {
    const lista = JSON.parse(await ipcRenderer.invoke('get-secciones'));
    for await(let seccion of lista){
        const option = document.createElement('option');
        option.value = seccion.nombre;
        option.text = seccion.nombre;
        secciones.appendChild(option)
    }
}