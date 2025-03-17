const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");


const tbody = document.querySelector('tbody');

const desde = document.getElementById('desde');
const hasta = document.getElementById('hasta');

const buscador = document.getElementById('buscador');
const total = document.getElementById('total');

const agregar = document.getElementById('agregar');
const salir = document.getElementById('salir');

const inputAgregarCateogoria = document.getElementById('agregarCateogoria');
const guardar = document.getElementById('guardar');
const modificar = document.getElementById('modificar');
const cancelar = document.getElementById('cancelar');

const fechaInput = document.getElementById('fecha');
const descripcion = document.getElementById('descripcion');
const importe = document.getElementById('importe');
const categoria = document.getElementById('categoria');

let gastos = [];
let categoriaGastos = [];

const fechaUTC = () => {
    const fecha = new Date(`${fechaInput.value}T00:00:00.000Z`);

    const ahora = new Date();
    const hours = ahora.getUTCHours();
    const minuts = ahora.getUTCMinutes();
    const seconds = ahora.getUTCSeconds();

    fecha.setUTCHours(hours, minuts, seconds);
    //Lo que hacemos es conver la fecha y la hpora para que la base de datos de mongo db lo entienda bien
    const fechaUTC = new Date(
        Date.UTC(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate(),
            fecha.getHours(),
            fecha.getMinutes(),
            fecha.getSeconds(),

        )
    )

    return fechaUTC;
};

const listarGastos = (lista) => {
    tbody.innerHTML = '';
    let suma = 0;

    lista.sort((a, b) => {
        if (a.fecha > b.fecha) {
            return 1
        };

        if (b.fecha > a.fecha) {
            return -1
        };

        return 0;
    });

    for (let elem of lista) {
        const tr = document.createElement('tr');
        tr.id = elem._id;

        const tdFecha = document.createElement('td');
        const tdDescripcion = document.createElement('td');
        const tdImporte = document.createElement('td');
        const tdTipo = document.createElement('td');
        const tdAcciones = document.createElement('td');

        const divAcciones = document.createElement('div')

        const botonUpdate = document.createElement('button');
        const botonDelete = document.createElement('button');

        divAcciones.classList.add('flex');
        divAcciones.classList.add('gap-2');
        divAcciones.classList.add('mt-1');
        divAcciones.classList.add('mb-1');
        divAcciones.classList.add('justify-center');

        const fecha = elem.fecha.slice(0, 10).split('-', 3).reverse().join('/');
        const hora = elem.fecha.slice(11, 19);

        tdFecha.innerText = `${fecha}  ${hora}`
        tdDescripcion.innerText = elem.descripcion;
        tdImporte.innerText = elem.importe.toFixed(2);
        tdTipo.innerText = elem.categoria.nombre;

        botonUpdate.classList.add('tool');
        botonDelete.classList.add('tool');

        botonUpdate.innerHTML = `<span id=edit class=material-icons>edit</span>`;
        botonDelete.innerHTML = `<span id=edit class=material-icons>delete</span>`;

        botonUpdate.addEventListener('click', updateGasto);
        botonDelete.addEventListener('click', deleteGasto);

        divAcciones.appendChild(botonUpdate);
        divAcciones.appendChild(botonDelete);

        tdAcciones.appendChild(divAcciones);

        tr.appendChild(tdFecha)
        tr.appendChild(tdDescripcion)
        tr.appendChild(tdImporte)
        tr.appendChild(tdTipo)
        tr.appendChild(tdAcciones)

        tbody.appendChild(tr);

        suma += elem.importe;
    };

    total.value = suma.toFixed(2);
};

const deleteGasto = async (e) => {

    const { isConfirmed } = await Swal.fire({
        title: 'Seguro quiere elimina el gasto?',
        confirmButtonText: 'Eliminar',
        showCancelButton: true
    });


    if (isConfirmed) {
        let id = '';

        if (e.target.nodeName === 'BUTTON') {
            id = e.target.parentNode.parentNode.parentNode.id;
        } else {
            id = e.target.parentNode.parentNode.parentNode.parentNode.id;
        };

        await ipcRenderer.invoke('delete-gasto', id);

        gastos = gastos.filter(elem => elem._id !== id);

        listarGastos(gastos);
    };
};

const updateGasto = async (e) => {
    let id = '';

    if (e.target.nodeName === 'BUTTON') {
        id = e.target.parentNode.parentNode.parentNode.id;
    } else {
        id = e.target.parentNode.parentNode.parentNode.parentNode.id;
    };

    const gasto = gastos.find(elem => elem._id === id);

    fechaInput.value = gasto.fecha.slice(0, 10);
    descripcion.value = gasto.descripcion;
    importe.value = gasto.importe.toFixed(2);
    categoria.value = gasto.categoria._id;

    modal.classList.remove('none');
    modificar.classList.remove('none');
    guardar.classList.add('none');

};

const cargarPagina = async () => {
    const [y, m, d] = new Date().toLocaleDateString().split('/').reverse();

    desde.value = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    hasta.value = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`

    buscarPorFechaGastos()
    categoriaGastos = JSON.parse(await ipcRenderer.invoke('get-categoriaGasto'));


    listarCategoria(categoriaGastos)
    listarGastos(gastos)
};

const listarCategoria = async (lista) => {
    categoria.innerHTML = '<option value="">---Seleccionar Una Opcion---</option>';
    for (let elem of lista) {
        const option = document.createElement('option');

        option.value = elem._id;
        option.text = elem.nombre;

        categoria.appendChild(option)
    };
}

const abrirModal = async () => {

    const modal = document.getElementById('modal');

    modal.classList.remove('none');
    modificar.classList.add('none');
    guardar.classList.remove('none');

};

const guardarGasto = async () => {

    const gasto = {};

    gasto.fecha = fechaUTC().toISOString();
    gasto.descripcion = descripcion.value;
    gasto.importe = importe.value;
    gasto.categoria = categoria.value;


    const newGasto = JSON.parse(await ipcRenderer.invoke('post-gasto', gasto));
    gastos.push(newGasto);

    document.getElementById('modal').classList.add('none');

    listarGastos(gastos);

    fechaInput.value = '';
    descripcion.value = '';
    importe.value = '';


};

const filtrar = (e) => {
    const texto = e.target.value;

    const gastosFiltrados = gastos.filter(elem =>
        elem.descripcion.toUpperCase().includes(texto.toUpperCase())
        || elem.importe.toFixed(2).includes(texto)
        || elem.categoria.nombre.toUpperCase().includes(texto.toUpperCase())
    )

    listarGastos(gastosFiltrados)
};

const agregarCateogoria = async () => {
    const { isConfirmed, value } = await Swal.fire({
        title: 'Agregar Categoria',
        confirmButtonText: 'Guardar',
        showCancelButton: true,
        input: 'text'
    });

    if (isConfirmed) {
        const categoriaGasto = JSON.parse(await ipcRenderer.invoke('post-categoriaGasto', { nombre: value }));

        categoriaGastos.push(categoriaGasto);


        listarCategoria(categoriaGastos)

    }
};

const buscarPorFechaGastos = async () => {
    const data = JSON.parse(await ipcRenderer.invoke('get-gastos-for-date', {
        desde: desde.value,
        hasta: hasta.value
    }));

    gastos = data;

    listarGastos(gastos)
};

const modificarGasto = async () => {
    const gasto = {};

    gasto.fecha = fechaUTC().toISOString();
    gasto.descripcion = descripcion.value;
    gasto.importe = importe.value;
    gasto.categoria = categoria.value;

    const gastoUpdate = ipcRenderer.invoke('update-gasto', gasto);
};

agregar.addEventListener('click', abrirModal);

modificar.addEventListener('click', modificarGasto)

buscador.addEventListener('keyup', filtrar);

inputAgregarCateogoria.addEventListener('click', agregarCateogoria)

guardar.addEventListener('click', guardarGasto);

window.addEventListener('load', cargarPagina);

desde.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        hasta.focus()
    };
});

hasta.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        buscarPorFechaGastos();
    }
})

salir.addEventListener('click', e => {
    location.href = '../menu.html'
});

cancelar.addEventListener('click', e => {

    fecha.value = '';
    descripcion.value = '';
    importe.value = '';
    categoria.value = '',

        modal.classList.add('none');

});

document.addEventListener('keyup', e => {
    if (e.keyCode === 27) {
        location.href = '../menu.html';
    };
});