require('dotenv').config();
const { default: axios } = require("axios");
const { default: Swal } = require('sweetalert2');
const URL = process.env.ROTISERIA_URL;


const volver = document.getElementById('volver');
const mesas_abiertas = document.getElementById('mesas_abiertas');
const boton_abrir_mesa = document.getElementById('boton_abrir_mesa');
const modal = document.getElementById('modal');
const cerrarModal = document.getElementById('cerrarModal');
const listadoMesas = document.getElementById('listadoMesas');

let mesas = [];

const abrirMesa = async (e) => {
    const elemento = e.currentTarget;

    try {
        const { data } = await axios.patch(`${URL}mesa/${elemento.id}`);
        if (data.ok) {
            elemento.classList.add('modalMesaAbierta');
            mesas.push(data.mesa);
            listarMesasAbiertas(mesas)
            cerrarModal.click();
        } else {
            await Swal.fire('Error al abrir mesa', error, 'error');
        }
    } catch (error) {
        console.log(error);
        await Swal.fire('Error al abrir mesa', error, 'error')
    }
};

const abrirVenta = async (e) => {
    console.log(e.currentTarget)

    location.href = `../venta/index.html?mesa=${e.currentTarget.id}`;
}

const cargarPagina = async () => {
    try {
        const { data } = await axios.get(`${URL}mesa`);
        if (data.ok) {
            listarMesas(data.mesas)
        } else {
            await Swal.fire('Error al obtener mesas', error, 'error');
        };

    } catch (error) {
        await Swal.fire('Error al obtener mesas', error, 'error');
    };

    try {
        const { data } = await axios.get(`${URL}mesa/abierto`);

        if (data.ok) {
            mesas = data.mesas;
            listarMesasAbiertas(data.mesas)
        } else {
            await Swal.fire('Error al traer las mesas abiertas', error.msg, 'error');
        };
    } catch (error) {
        console.log(error)
        await Swal.fire('Error al traer las mesas abiertas', error?.msg, 'error');
    }
};

const listarMesasAbiertas = (mesas) => {
    mesas_abiertas.innerHTML = '';
    for (let mesa of mesas) {
        const div = document.createElement('div');
        div.id = mesa._id;

        div.classList.add('mesaAbierta')
        div.classList.add('py-2')

        const h3 = document.createElement('h3');
        const nombre = document.createElement('p');
        const precio = document.createElement('span');

        div.addEventListener('click', abrirVenta)


        h3.innerText = `Mesa ${mesa.nombre}`;
        nombre.innerText = `${mesa.productos.length} producto(s)`;
        precio.innerText = `$${mesa.precio.toFixed(2)}`

        div.appendChild(h3);
        div.appendChild(nombre);
        div.appendChild(precio);

        mesas_abiertas.appendChild(div);
    }
};

const listarMesas = (mesas) => {
    for (let mesa of mesas) {
        const div = document.createElement('div');

        div.id = mesa._id;

        div.classList.add('mesaModal');

        const h3 = document.createElement('h3');
        const nombre = document.createElement('p');

        h3.innerText = 'Mesa';
        nombre.innerText = mesa.nombre;

        div.appendChild(h3)
        div.appendChild(nombre)

        if (mesa.estado !== 'abierto') {
            div.addEventListener('click', abrirMesa);
        } else {
            const span = document.createElement('span');
            span.innerText = 'abierta';
            div.appendChild(span);
            div.classList.add('modalMesaAbierta')
        }

        listadoMesas.appendChild(div);
    }
};

window.addEventListener('load', cargarPagina);


boton_abrir_mesa.addEventListener('click', e => {
    modal.classList.remove('none')
});

cerrarModal.addEventListener('click', e => {
    modal.classList.add('none')
});

volver.addEventListener('click', () => {
    location.href = '../menu.html';
});