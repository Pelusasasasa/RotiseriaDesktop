const axios = require('axios');
require("dotenv").config();
const URL = process.env.GESTIONURL;
const sweet = require('sweetalert2');

const {cerrarVentana, verificarUsuarios} = require('../helpers')

const {vendedores:verVendedores} = require('../configuracion.json')

const tbody = document.querySelector('tbody');

//botones
const agregar = document.querySelector('.agregar');
const eliminar = document.querySelector('.eliminar');

let vendedores = [];

let seleccionado

window.addEventListener('load',async e=>{

    if (verVendedores) {
        const vendedor = await verificarUsuarios();

        if (vendedor === "") {
            await sweet.fire({
                title:"Contraseña incorrecta"
            });
            location.reload();
        }else if(vendedor.permiso !== 0){
            await sweet.fire({
                title:"Acceso Denegado"
            });
            window.close();
        }
    }

    vendedores = (await axios.get(`${URL}vendedores`)).data;
    listarVendedores(vendedores)
});


const listarVendedores = (lista)=>{
    tbody.innerHTML = "";
    for(let vendedor of lista){
        const tr = document.createElement('tr');
        tr.id = vendedor._id;

        const tdCodigo = document.createElement('td');
        const tdNombre = document.createElement('td');
        const tdPermiso = document.createElement('td');
        const tdAcciones = document.createElement('td');

        tdAcciones.classList.add('acciones');

        tdCodigo.innerHTML = vendedor.codigo;
        tdNombre.innerHTML = vendedor.nombre;
        tdPermiso.innerHTML = vendedor.permiso;

        tdAcciones.innerHTML = `
            <div class=tool>
                <span class=material-icons>edit</span>
                <p class=tooltip>Modificar</p>
            </div>
            <div class=tool>
                <span class=material-icons>delete</span>
                <p class=tooltip>Eliminar</p>
            </div>
        `

        tr.appendChild(tdCodigo);
        tr.appendChild(tdNombre);
        tr.appendChild(tdPermiso);
        tr.appendChild(tdAcciones)

        tbody.appendChild(tr)
    }
};

agregar.addEventListener('click',e=>{
    sweet.fire({
        html:
            `<section>
                <main>
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" name="nombre" id="nombre" />
                </main>
                <main>
                    <label htmlFor="codigo">Codigo</label>
                    <input type="text" name="codigo" id="codigo" />
                </main>
                <main>
                    <label htmlFor="permisos">Permisos</label>
                    <input type="number" name="permisos" id="permisos" />
                </main>
            </section>`,
            confirmButtonText: "Aceptar",
            showCancelButton:true
    }).then(async({isConfirmed})=>{
        if (isConfirmed) {
            const vendedorNuevo = {};
            vendedorNuevo.nombre = document.getElementById('nombre').value.toUpperCase();
            vendedorNuevo.codigo = document.getElementById('codigo').value;
            vendedorNuevo.permiso = document.getElementById('permisos').value;
            try {
                await axios.post(`${URL}vendedores`,vendedorNuevo);
                location.reload();
            } catch (error) {
                console.log(error);
                await sweet.fire({
                    title:"No se pudo agregar Vendedor"
                })
            }
            
        }
    })
});

tbody.addEventListener('click',async e=>{
    seleccionado && seleccionado.classList.remove('seleccionado')
    
    if (e.target.nodeName === "TD") {
        seleccionado = e.target.parentNode;
    }else if(e.target.nodeName === "DIV"){
        console.log(e.target)
        seleccionado = e.target.parentNode.parentNode;
    }else if(e.target.nodeName === "SPAN"){
        seleccionado = e.target.parentNode.parentNode.parentNode;
    }

    seleccionado.classList.add('seleccionado');

    if (e.target.innerHTML === "edit") {
        sweet.fire({
            title:"Modificar Vendedor",
            html:`
                <section class=input>
                    <main>
                        <label htmlFor="nombre">Nombre</label>
                        <input type="text" name="nombre" value=${seleccionado.children[1].innerHTML} id="nombre" />
                    </main>
                    <main>
                        <label htmlFor="codigo">Codigo</label>
                        <input type="text" name="codigo" value=${seleccionado.children[0].innerHTML} id="codigo" />
                    </main>
                    <main>
                        <label htmlFor="permisos">Permisos</label>
                        <input type="number" name="permisos" value=${seleccionado.children[2].innerHTML} id="permisos" />
                    </main>
                </section>
            `,
            showCancelButton:true,
            confirmButtonText:"Modificar"
        }).then(async({isConfirmed})=>{
            if (isConfirmed) {
                const vendedorNuevo = {}
                vendedorNuevo.nombre = document.getElementById('nombre').value.toUpperCase();
                vendedorNuevo.codigo = document.getElementById('codigo').value;
                vendedorNuevo.permiso = document.getElementById('permisos').value;

                try {
                    await axios.put(`${URL}vendedores/id/${seleccionado.id}`,vendedorNuevo);
                    await sweet.fire({
                        title:`${vendedorNuevo.nombre} Modificado`
                    });
                    location.reload();
                } catch (error) {
                    console.log(error)
                    sweet.fire({
                        title: "No se pudo modficar el vendedor"
                    })
                }
            }
        })
    }else if(e.target.innerHTML === "delete"){
        await sweet.fire({
            title:"Eliminar Vendedor?",
            confirmButtonText:"Aceptar",
            showCancelButton:true
        }).then(async({isConfirmed})=>{
            if (isConfirmed) {
                try {
                    await axios.delete(`${URL}vendedores/id/${seleccionado.id}`);
                    tbody.removeChild(seleccionado);
                } catch (error) {
                    console.log(error)
                    sweet.fire({
                        title:"No se pudo borrar vendedor"
                    })
                }
            }
        })
    }
});


document.addEventListener('keyup',e=>{
    cerrarVentana(e)
})