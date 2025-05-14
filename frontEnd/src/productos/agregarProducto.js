const salir = document.querySelector('.salir');
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
const guardar = document.querySelector('.guardar');

const sweet  = require('sweetalert2');
const {cerrarVentana,apretarEnter, redondear, agregarMovimientoVendedores} = require('../helpers');

const archivo = require('../configuracion.json');

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

window.addEventListener('load',e=>{
    cargarSelecciones();
})

guardar.addEventListener('click',async ()=>{
    const producto = {}
    let banderaImg = {
        isConfirmed:true
    };

    if (img.files[0]) {
        const imgBuffer = await sharp(img.files[0].path)
        .resize(400)
        .jpeg({ mozjpeg: true })
        .toBuffer();

        fs.writeFileSync(path.join(__dirname,'..',`imgProductos/${codigo.value}.png`),imgBuffer);
    }else{
        banderaImg = await sweet.fire({
            title:"No puso una imagen, Desea Guardar sin Imagen?",
            showCancelButton:true,
            confirmButtonText:"Aceptar"
        });
    }
    if (banderaImg.isConfirmed) {
        producto._id = codigo.value;
        producto.descripcion = descripcion.value.trim().toUpperCase();
        producto.provedor = provedor.value.toUpperCase().trim();
        producto.stock = parseFloat(stock.value);
        producto.textBold = textBold.checked === true ? true : false;
        producto.costo = parseFloat(costo.value);
        producto.ganancia = parseFloat(ganancia.value);
        producto.precio = parseFloat(total.value);
        producto.seccion = secciones.value;
        ipcRenderer.send('post-producto',producto);
        window.close();
    }
});

codigo.addEventListener('keypress',async e=>{
    if (e.keyCode === 13) {
        let productoYaCreado;
        await ipcRenderer.invoke('get-producto',codigo.value).then((result)=>{
            productoYaCreado = JSON.parse(result);
        });
        console.log(productoYaCreado)
        if (productoYaCreado) {
            await sweet.fire({
                title:`Codigo ya utilizado en ${productoYaCreado.descripcion}` 
            });
            codigo.value = "";
        }else{
            descripcion.focus();
        }
    }
});

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,secciones);
});

secciones.addEventListener('keypress',e=>{
    e.preventDefault();
    apretarEnter(e,provedor);
});

provedor.addEventListener('keypress',e=>{
    apretarEnter(e,img);
});

textBold.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
});

stock.addEventListener('keypress',e=>{
    apretarEnter(e,costo);
});

costo.addEventListener('keypress',e=>{
    apretarEnter(e,total)
});

ganancia.addEventListener('keypress',e=>{
    apretarEnter(e,guardar);
});

total.addEventListener('keypress',e=>{
    apretarEnter(e,ganancia);
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keydown',e=>{
    cerrarVentana(e)
});

codigo.addEventListener('focus',e=>{
    codigo.select();
});

descripcion.addEventListener('focus',e=>{
    descripcion.select();
});

provedor.addEventListener('focus',e=>{
    provedor.select();
});

stock.addEventListener('focus',e=>{
    stock.select();
});

costo.addEventListener('focus',e=>{
    costo.select();
});

ganancia.addEventListener('focus',e=>{
    ganancia.select();

    ganancia.value = redondear((parseFloat(total.value) - parseFloat(costo.value)) * 100 / parseFloat(costo.value),2);
});

total.addEventListener('focus',e=>{
    total.select();
});


//Lo usamos para cargar las selecciones
async function cargarSelecciones(){
    const lista = JSON.parse(await ipcRenderer.invoke('get-secciones'));
    for await (let seccion of lista){
        const option = document.createElement('option');
        option.value = seccion._id;
        option.text = seccion.nombre;
        secciones.appendChild(option)
    }
};
