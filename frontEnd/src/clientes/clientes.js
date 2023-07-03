function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let vendedor = getParameterByName("vendedor")
let permiso = getParameterByName("permiso");
permiso = permiso === "" ? 0 : parseInt(permiso);

const sweet = require('sweetalert2');
const { ipcRenderer } = require('electron');

// const axios = require('axios');
// require('dotenv').config()
// const URL = process.env.GESTIONURL;

const {recorrerFlechas, copiar, agregarMovimientoVendedores} = require('../helpers');

const thead = document.querySelector('thead');
const tbody = document.querySelector('tbody');

const agregar = document.querySelector('.agregar');
const nombre = document.querySelector('#nombre');
const botones = document.querySelector('.botones');
const salir = document.querySelector('.salir');

//variables
let ventanaSecundaria = false
let seleccionado;
let subSeleccionado;

window.addEventListener('load',e=>{
    copiar();
    filtrar();
});

const filtrar = async()=>{
    tbody.innerHTML = "";
    let clientes;
    if (nombre.value !== "") {
        await ipcRenderer.invoke('gets-clientes-con-filtro',nombre.value.toUpperCase()).then((result)=>{
           clientes = JSON.parse(result);
           console.log(clientes) 
        })
    }else{
        await ipcRenderer.invoke('gets-clientes').then((result)=>{
            clientes = JSON.parse(result);
        });
    }
    listarClientes(clientes);
}

nombre.addEventListener('keyup',filtrar);

//Esto sirve para ver si estamos en una ventana secundaria o en la principal
//la cual va a mostrar o no la parte de botones
//Y luego podemos mandarle el cliente a la ventana principal si esta es ventana secundaria
ipcRenderer.on('informacion',(e,args)=>{
    if (!args.botones) {
        botones.classList.add('none');
        thead.querySelector('th.acciones').parentNode.removeChild((thead.querySelector('th.acciones')));
        ventanaSecundaria = true;
    } 
});


//abrimos una ventana para agregar cliente
agregar.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana',{path:"./clientes/agregarCliente.html",altura:500,ancho:1200,vendedor:vendedor});
});


//listamos los clientes, con sus datos
const listarClientes = async(clientes)=>{

    clientes.sort((a,b)=>{
        if (a.nombre > b.nombre) {
            return 1;
        }else if(a.nombre < b.nombre){
            return -1;
        }
        return 0;
    })

    for await(let {_id,nombre,telefono,direccion,cuit,condicionIva,saldo} of clientes){
        const tr = document.createElement('tr');
        tr.id = _id;

        const tdId = document.createElement('td');
        const tdNombre = document.createElement('td');
        const tdDireccion = document.createElement('td');
        const tdTelefono = document.createElement('td');
        const tdCuit = document.createElement('td');
        const tdCondicionIva = document.createElement('td');
        const tdSaldo = document.createElement('td');
        const tdAcciones = document.createElement('td');

        tdAcciones.classList.add('acciones');

        tdId.innerHTML = _id;
        tdNombre.innerHTML = nombre;
        tdDireccion.innerHTML = direccion;
        tdTelefono.innerHTML = telefono;
        tdCuit.innerHTML = cuit ? cuit : ""
        tdCondicionIva.innerHTML = condicionIva ? condicionIva : ""
        tdSaldo.innerHTML = saldo.toFixed(2);
        tdAcciones.innerHTML = `
            <div class=tool>
                <span class=material-icons>edit</span>
                <p class=tooltip>Modificar</p>
            </div>
            <div class="tool ${_id === 1 && "none"}">
                <span class=material-icons>delete</span>
                <p class=tooltip>Eliminar</p>
            </div>
        `
        tr.appendChild(tdId);
        tr.appendChild(tdNombre);
        tr.appendChild(tdDireccion);
        tr.appendChild(tdTelefono);
        tr.appendChild(tdCuit);
        tr.appendChild(tdCondicionIva);
        tr.appendChild(tdSaldo);
        if (!ventanaSecundaria) {
            tr.appendChild(tdAcciones);
            
        }
        tbody.appendChild(tr);
    };
    seleccionado = tbody.firstElementChild;
    seleccionado.classList.add('seleccionado');

    subSeleccionado = seleccionado.children[0];
    subSeleccionado.classList.add('subSeleccionado');
}

//si hacemos click en un tr que se cambie el seleccionado
tbody.addEventListener('click',async e=>{
        seleccionado && seleccionado.classList.remove('seleccionado');
        subSeleccionado && subSeleccionado.classList.remove('subSeleccionado');

        if (e.target.nodeName === "TD") {
            seleccionado = e.target.parentNode;
            subSeleccionado = e.target;
        }else if(e.target.nodeName === "DIV"){
            seleccionado = e.target.parentNode.parentNode;
            subSeleccionado = e.target.parentNode
        }else if(e.target.nodeName){
            seleccionado = e.target.parentNode.parentNode.parentNode;
            subSeleccionado = e.target.parentNode.parentNode;
        }

        seleccionado.classList.add('seleccionado');
        subSeleccionado.classList.add('subSeleccionado');


        if (e.target.innerHTML === "delete") {
            await sweet.fire({
                title:"Seguro eliminar " + seleccionado.children[1].innerHTML,
                confirmButtonText:"Aceptar",
                showCancelButton:true
            }).then(async({isConfirmed})=>{
                if (isConfirmed) {
                    ipcRenderer.send('eliminar-Cliente',seleccionado.id);
                    tbody.removeChild(seleccionado);
                    // try {
                    //     const mensaje = (await axios.delete(`${URL}clientes/id/${seleccionado.id}`)).data;
                    //     vendedor && agregarMovimientoVendedores(`Elimino el cliente ${seleccionado.children[1].innerHTML} con direccion en ${seleccionado.children[2].innerHTML}`,vendedor);
                    //     await sweet.fire({
                    //         title:mensaje
                    //     });
                    //     tbody.removeChild(seleccionado);
                    // } catch (error) {
                    //     console.log(error)
                    //     sweet.fire({
                    //         title:"No se pudo Eliminar el cliente"
                    //     })
                    // }
                }
            })
        }else if(e.target.innerHTML === "edit"){
            ipcRenderer.send('abrir-ventana',
                {path:"clientes/modificarCliente.html",
                altura:500,
                informacion:seleccionado.id,
                vendedor:vendedor
            });
        }
});

document.addEventListener('keydown',e=>{
    if(e.key === "Escape" && ventanaSecundaria){
        ipcRenderer.send('enviar',{
            tipo:"Ningun cliente",
            informacion:""
        })
        window.close();  
    }else if(e.key === "Escape" && !ventanaSecundaria){
        location.href ='../menu.html';
    }
});

document.addEventListener('keydown',e=>{
        if(e.keyCode === 13 && seleccionado && ventanaSecundaria){
            ipcRenderer.send('enviar',{
                tipo:"cliente",
                informacion:seleccionado.id
            });
            window.close();
        }
        if (document.activeElement.nodeName !== "INPUT") {
            recorrerFlechas(e.keyCode);
        }
        if (document.activeElement.nodeName === "INPUT" && e.keyCode === 40) {
            nombre.blur();
        }
});

//recibimos el cliente una vez modificado
ipcRenderer.on('recibir-ventana-secundaria',(e,args)=>{
    const clienteModificado = JSON.parse(args);
    const tr = document.getElementById(`${clienteModificado._id}`);
    tr.children[0].innerHTML = clienteModificado._id;
    tr.children[1].innerHTML = clienteModificado.nombre;
    tr.children[2].innerHTML = clienteModificado.direccion;
    tr.children[3].innerHTML = clienteModificado.telefono;
    tr.children[4].innerHTML = clienteModificado.cuit;
    tr.children[5].innerHTML = clienteModificado.condicionIva;
});

salir.addEventListener('click',e=>{
    location.href = "../menu.html";
});