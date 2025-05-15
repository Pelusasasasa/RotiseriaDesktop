require('dotenv').config();
const URL = process.env.ROTISERIA_URL;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

let vendedor = getParameterByName("vendedor")
let permiso = getParameterByName("permiso");
permiso = permiso === "" ? 0 : parseInt(permiso);

const { ipcRenderer } = require("electron");
const sweet = require('sweetalert2');
const path = require('path');
const { recorrerFlechas,copiar, redondear, agregarMovimientoVendedores } = require("../helpers");

let seleccionado;
let subSeleccionado;
let ventanaSecundaria = false;

const body = document.querySelector('body');
const seleccion = document.querySelector('#seleccion');
const agregar = document.querySelector('.agregar');
const salir = document.querySelector('.salir');
const buscador = document.querySelector('#buscarProducto');
const seccionTarjetas = document.querySelector('.tarjetas');

const clickEnTarjetas = (e) => {
    
    seleccionado && seleccionado.classList.toggle('seleccionado');
    subSeleccionado && subSeleccionado.classList.remove('subSeleccionado');

    if (e.target.classList.contains('tarjeta')) {
        seleccionado = e.target;
    }else if(e.target.nodeName === "IMG"){
        seleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "H4"){
        seleccionado = e.target.parentNode;
    }else if(e.target.id === "precio"){
        seleccionado = e.target.parentNode;
    }else if(e.target.classList.contains('divBotones')){
        seleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "BUTTON"){
        seleccionado = e.target.parentNode.parentNode;
    }else if(e.target.nodeName === "SPAN"){
        seleccionado = e.target.parentNode.parentNode.parentNode.parentNode;
    };

    if (e.target.innerHTML === "delete") {
        sweet.fire({
            title:"Seguro Borrar " + seleccionado.children[1].innerHTML,
            "showCancelButton":true,
            "confirmButtonText":"Aceptar"
        }).then(async (result)=>{
            if (result.isConfirmed) {
                ipcRenderer.send('delete-producto',seleccionado.id);
                seccionTarjetas.removeChild(seleccionado);
            }
        })
    }else if(e.target.innerHTML === "edit"){
        const opciones = {
            path: "./productos/modificarProducto.html",
            botones:true,
            informacion:seleccionado.id,
            altura:600,
            vendedor:vendedor
        }
        ipcRenderer.send('abrir-ventana',opciones);
        
    }
};

const listarTarjetas = async (productos)=>{
    seccionTarjetas.innerText = "";
    for(let producto of productos){
        const div = document.createElement('div');
        div.classList.add('tarjeta');
        div.id = producto._id;
        div.classList.add(producto.id);

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
        img.setAttribute('alt',producto.descripcion);
        agregar.addEventListener('click',mandarProducto);
        x6.addEventListener('click',mandarMediaDocena);
        x12.addEventListener('click',mandarDocena);
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

        agregar.classList.add('botonAgregar');
        eliminar.classList.add('botonBorrar');
        modificar.classList.add('botonModificar');

        if (!ventanaSecundaria) {
            agregar.classList.add('none');
            x6.classList.add('none');
            x12.classList.add('none');
        }else{
            eliminar.classList.add('none');
            modificar.classList.add('none')
        }

        divBotones.appendChild(modificar);
        divBotones.appendChild(eliminar);
        divBotones.appendChild(agregar);
        producto.seccion === "EMPANADAS" && divBotones.appendChild(x6);
        producto.seccion === "EMPANADAS" && divBotones.appendChild(x12);

        div.appendChild(img)
        div.appendChild(titulo);
        div.appendChild(id)
        div.appendChild(divInformacion)
        div.appendChild(divBotones);

        seccionTarjetas.appendChild(div);
    }
};

const filtrar = async()=>{
    let condicion = seleccion.value;
    if (condicion === "codigo") {
        condicion="_id";
    };
    const descripcion = buscador.value !== "" ? buscador.value : "textoVacio";
    let producto;
    await ipcRenderer.invoke('gets-productos-for-descripcion-and-seleccion',[descripcion,condicion]).then((result)=>{
        producto = JSON.parse(result);
    });
    producto.length !== 0 && listarTarjetas(producto);
};

const categorias = async() => {
    const divCategorias = document.querySelector('.categorias');
    const secciones = JSON.parse(await ipcRenderer.invoke('get-secciones'));
    for await(let seccion of secciones){
        const button = document.createElement('button');
        button.innerText = seccion.nombre;
        button.id = seccion._id;
        divCategorias.appendChild(button);


        button.addEventListener('click',mostrarProductosPorCategoria);
    }
};

//funcion para enviar docena de empanadas de un sabor
const mandarDocena = async(e) => {
    seleccionado = e.target.parentNode.parentNode.parentNode.parentNode;
    const {isConfirmed} = await sweet.fire({
        title:`Docena de ${seleccionado.children[1].innerText}?`,
        showCancelButton:true,
        confirmButtonText:"Aceptar"
    });

    if (isConfirmed) {
        ipcRenderer.send('enviar',{
            informacion:seleccionado.id,
            cantidad:"12",
            tipo:"producto",
            descripcion:seleccionado.children[1].innerHTML
        })
    }
};

//funcion para enviar media docena de empanadas de un sabor
const mandarMediaDocena = async(e) => {
    seleccionado = e.target.parentNode.parentNode.parentNode.parentNode
    const {isConfirmed} = await sweet.fire({
        title:`Media Docena de ${seleccionado.children[1].innerText}?`,
        showCancelButton:true,
        confirmButtonText:"Aceptar"
    });

    if (isConfirmed) {
        ipcRenderer.send('enviar',{
            informacion:seleccionado.id,
            cantidad:"6",
            tipo:"producto",
            descripcion:seleccionado.children[1].innerHTML
        })
    }
};


const mandarProducto = async(e) => {
    if (ventanaSecundaria) {
        const {isConfirmed,value} = await sweet.fire({
            title:"Cantidad a Agregar",
            showCancelButton:true,
            confirmButtonText:"Aceptar",
            input:"number"
        });
    
        if (isConfirmed) {
            ipcRenderer.send('enviar',{
                informacion:seleccionado.id,
                cantidad:value,
                tipo:"producto",
                descripcion:seleccionado.children[1].innerHTML,
            });
        }
    }
    buscador.focus();
};

const mostrarProductosPorCategoria = async(e) => {
    const id = e.target.id;

    if(e.target.innerText === 'TODOS'){
        filtrar();
    }else{
        const productos = JSON.parse(await ipcRenderer.invoke('gets-productos-for-seccion',id));
        listarTarjetas(productos);
    };
    

};


ipcRenderer.on('informacion-a-ventana',(e,args)=>{
    const producto = JSON.parse(args);
    if (mostrarLista) {
        const trModificado = document.getElementById(producto._id);
        trModificado.children[1].innerHTML = producto.descripcion;
        trModificado.children[2].innerHTML = producto.precio.toFixed(2);
        trModificado.children[3].innerHTML = producto.stock.toFixed(2);
        if(producto.textBold){
            trModificado.classList.add('text-bold');
        }else{
            trModificado.classList.remove('text-bold');
        }
    }else{
        const divModificado = seccionTarjetas.querySelector(`.tarjetas #${CSS.escape(producto._id)}`);
        divModificado.children[1].innerText = producto.descripcion;
        divModificado.children[0].setAttribute('src',producto.img + "?timestamp=" + new Date().getTime())
        document.querySelector(`.tarjetas #${CSS.escape(producto._id)} #precio`).innerText = producto.precio.toFixed(2);
        document.querySelector(`.tarjetas #${CSS.escape(producto._id)} #stock`).innerText = producto.stock.toFixed(2);
    }
});

buscador.addEventListener('keyup',e=>{
    if ((buscador.value === "" && e.keyCode === 40) || (buscador.value === "" && e.keyCode === 39)) {
        buscador.blur();
    }
});

buscador.addEventListener('keyup',filtrar);
seccionTarjetas.addEventListener('click',clickEnTarjetas);

agregar.addEventListener('click',e=>{
    const opciones = {
        path: "./productos/agregarProducto.html",
        botones:true,
        altura:600,
        vendedor:vendedor
    }
    ipcRenderer.send('abrir-ventana',opciones);
});

//Vemos si llega una informacion de que se abrio desde otra ventana 

body.addEventListener('keypress',e=>{
    if (document.activeElement.nodeName !== "INPUT") {
        if (e.key === "Enter" && ventanaSecundaria){
            console.log(seleccionado)
            if (seleccionado) {
            }else{
                sweet.fire({title:"Producto no seleccionado"});
            }
        }
    }
});


window.addEventListener('load',async e=>{
    filtrar();
    copiar();
    categorias();
});


salir.addEventListener('click',e=>{
    location.href = "../menu.html";
});

document.addEventListener("keydown",e=>{
    if (e.key === "Escape" && ventanaSecundaria) {
        window.close();
    }else if(e.key === "Escape" && !ventanaSecundaria){
        location.href = "../menu.html";
    }
    recorrerFlechas(e.keyCode);
});


ipcRenderer.on('informacion',async (e,args)=>{
    const botones = args.botones;
    if(!botones){
        const botones = document.querySelector('.botones');
        botones.classList.add('none');
        ventanaSecundaria = true;
        seleccion.value = "descripcion";
        await filtrar();
    }
});
