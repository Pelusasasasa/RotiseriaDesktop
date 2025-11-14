require('dotenv').config();
const { default: axios } = require("axios");
const { default: Swal } = require('sweetalert2');
const URL = process.env.ROTISERIA_URL;


const agregarMesa = document.getElementById('agregarMesa');
const volver = document.getElementById('volver');
const mesas_abiertas = document.getElementById('mesas_abiertas');
const boton_abrir_mesa = document.getElementById('boton_abrir_mesa');
const modal = document.getElementById('modal');
const cerrarModal = document.getElementById('cerrarModal');
const listadoMesas = document.getElementById('listadoMesas');

let mesas = [];
let todasLasMesas = [];

const abrirMesa = async (e) => {
    const elemento = e.currentTarget;

    try {
        const { data } = await axios.patch(`${URL}mesa/${elemento.id}`);
        if (data.ok) {
            elemento.classList.add('modalMesaAbierta');
            mesas.push(data.mesa);
            listarMesasAbiertas(mesas);

            for (let elem of todasLasMesas) {
                if (elem._id === elemento.id) {
                    elem.estado = 'abierto';
                    break;
                };
            };
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
    const id = e.currentTarget.id


    if (e.target.id === 'cerrarMesa') {
        const { isConfirmed } = await Swal.fire({
            title: 'Seguro quiere cerrar la ventana?',
            showCancelButton: true,
            confirmButtonText: 'Cerrar'
        });

        if (isConfirmed) {
            const { data } = await axios.patch(`${URL}mesa/cerrar/${id}`);
            if (data.ok) {
                mesas = mesas.filter(elem => elem._id !== data.mesa._id);

                for (let elem of todasLasMesas) {
                    if (elem._id === data.mesa._id) {
                        elem.estado = 'cerrado';
                        break;
                    };
                };

                listarMesas(todasLasMesas);
                listarMesasAbiertas(mesas);
            }
        }
    } else {
        location.href = `../venta/index.html?mesa=${e.currentTarget.id}`;
    };

};

const agregarNuevaMesa = async (e) => {
    const { isConfirmed, value } = await Swal.fire({
        confirmButtonText: 'Agregar',
        showCancelButton: true,
        input: 'text',
        inputPlaceholder: 'Ej: 1',
        title: 'Nombre de la mesa'
    });

    if (isConfirmed) {
        const { data } = await axios.post(`${URL}mesa`, { nombre: value });

        if (data.ok) {
            todasLasMesas.push(data.mesa);
            listarMesas(todasLasMesas);
        } else {
            await Swal.fire(`Erro al cargar la mesa`, data.msg, 'error');
        }
    };
};

const cargarPagina = async () => {
    try {
        const { data } = await axios.get(`${URL}mesa`);
        if (data.ok) {
            todasLasMesas = data.mesas;
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

        const cruz = document.createElement('span');
        const h3 = document.createElement('h3');
        const nombre = document.createElement('p');
        const precio = document.createElement('span');

        cruz.classList.add('material-icons-outlined');
        cruz.classList.add('text-end', 'w-full', 'pr-2')

        cruz.id = 'cerrarMesa';

        div.addEventListener('click', abrirVenta);

        cruz.innerText = 'close';
        h3.innerText = `Mesa ${mesa.nombre}`;
        nombre.innerText = `${mesa.productos.length} producto(s)`;
        precio.innerText = `$${mesa.precio.toFixed(2)}`

        div.appendChild(cruz);
        div.appendChild(h3);
        div.appendChild(nombre);
        div.appendChild(precio);

        mesas_abiertas.appendChild(div);
    }
};

const listarMesas = (mesas) => {
    listadoMesas.innerHTML = '';

    for (let mesa of mesas) {
        const div = document.createElement('div');

        div.id = mesa._id;

        div.classList.add('mesaModal');

        const h3 = document.createElement('h3');
        const nombre = document.createElement('p');

        h3.innerText = 'Mesa';
        nombre.innerText = mesa.nombre;

        div.appendChild(h3);
        div.appendChild(nombre);



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

agregarMesa.addEventListener('click', agregarNuevaMesa);

boton_abrir_mesa.addEventListener('click', e => {
    modal.classList.remove('none')
});

cerrarModal.addEventListener('click', e => {
    modal.classList.add('none')
});

volver.addEventListener('click', () => {
    location.href = '../menu.html';
});