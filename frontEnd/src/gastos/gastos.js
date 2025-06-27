require('dotenv').config();
const axios = require('axios');
const { default: Swal } = require("sweetalert2");

const URL = process.env.ROTISERIA_URL;

const tbody = document.querySelector('tbody');

const gasto = document.getElementById('gasto');
const egreso = document.getElementById('egreso');

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
const cantidad = document.getElementById('cantidad');
const importe = document.getElementById('importe');
const totalInput = document.getElementById('totalInput');
const tipo = document.getElementById('tipo');
const categoria = document.getElementById('categoria');

let gastos = [];
let tipoSeleccionado = 'Gasto';
let categoriaGastos = [];


const clickEgreso = (e) => {

    if (!e.target.classList.contains('seleccionado')) {
        gasto.classList.remove('seleccionado');
        gasto.classList.remove('text-black');

        tipoSeleccionado = 'Egreso';

        e.target.classList.add('seleccionado');
        e.target.classList.add('text-black');
    }

    listarGastos(gastos);
};

const clickGasto = (e) => {
    if (!e.target.classList.contains('seleccionado')) {
        egreso.classList.remove('seleccionado');
        egreso.classList.remove('text-black');

        tipoSeleccionado = 'Gasto';

        e.target.classList.add('seleccionado');
        e.target.classList.add('text-black');

    }

    listarGastos(gastos);
};

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

    const listaAux = lista.filter(elem => elem.tipo === tipoSeleccionado)

    for (let elem of listaAux) {
        const tr = document.createElement('tr');
        tr.id = elem._id;

        const tdT = document.createElement('td');
        const tdFecha = document.createElement('td');
        const tdDescripcion = document.createElement('td');
        const tdCantidad = document.createElement('td');
        const tdImporte = document.createElement('td');
        const tdTotal = document.createElement('td');
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

        tdT.innerText = elem.tipo[0];
        tdFecha.innerText = `${fecha}  ${hora}`;
        tdDescripcion.innerText = elem.descripcion;
        tdCantidad.innerText = elem.cantidad?.toFixed(2);
        tdImporte.innerText = elem.importe?.toFixed(2);
        tdTotal.innerText = elem.total?.toFixed(2);
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

        tr.appendChild(tdT)
        tr.appendChild(tdFecha)
        tr.appendChild(tdDescripcion)
        tr.appendChild(tdCantidad)
        tr.appendChild(tdImporte)
        tr.appendChild(tdTotal)
        tr.appendChild(tdTipo)
        tr.appendChild(tdAcciones)

        tbody.appendChild(tr);
        
        suma += elem.total ? elem.total : 0;
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

        try {
            const { data } = await axios.delete(`${URL}gasto/${id}`);
            if (!data.ok) return await Swal.fire('Error al eliminar el gasto', data.msg, 'error');
            gastos = gastos.filter(elem => elem._id !== data.gastoEliminado._id);

            listarGastos(gastos);
        } catch (error) {
            console.log(error.response.data.msg);
            return await Swal.fire('Error al eliminar el gasto', error.response.data.msg, 'error');
        }

        
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

    modificar.id = id;

    fechaInput.value = gasto.fecha.slice(0, 10);
    descripcion.value = gasto.descripcion;
    cantidad.value = gasto.cantidad.toFixed(2);
    importe.value = gasto.importe.toFixed(2);
    totalInput.value = gasto.total.toFixed(2);
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
    try {
        const { data } = await axios.get(`${URL}categoriaGasto`);
        if(!data.ok) return await Swal.fire('Error al cargar las categorias de gastos', data.msg, 'error');
        categoriaGastos = data.categorias;
    } catch (error) {
        console.log(error.response.data.msg);
        return await Swal.fire('Error al cargar las categorias de gastos', error.response.data.msg, 'error');
    };

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

    if ('Invalid Date' == fechaUTC()) return await Swal.fire('Error al cargar un Gasto', 'Poner Una fecha', 'error');
    if (categoria.value == '') return await Swal.fire('Error al cargar el gasto', 'Falta poner un tipo de categoria', 'error');

    const gasto = {};

    gasto.fecha = new Date();
    gasto.descripcion = descripcion.value;
    gasto.cantidad = cantidad.value;
    gasto.importe = importe.value;
    gasto.total = totalInput.value;
    gasto.categoria = categoria.value;
    gasto.tipo = tipo.value;

    try {
        const { data } = await axios.post(`${URL}gasto`, gasto);
        if (!data.ok) return await Swal.fire('Error al cargar el gasto', data.msg, 'error');

        gastos.push(data.gasto);
    } catch (error) {
        console.log(error.response.data.msg);
        return await Swal.fire('Error al cargar el gasto', error.response.data.msg, 'error');
    };
    buscarPorFechaGastos();

    document.getElementById('modal').classList.add('none');

    listarGastos(gastos);

    fechaInput.value = '';
    descripcion.value = '';
    cantidad.value = '';
    importe.value = '';
    total.value = '';
    categoria.value = '';


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
        try {
            const { data } = await axios.post(`${URL}categoriaGasto`, { nombre: value});
            if(!data.ok) return await Swal.fire('Error al cargar las categorias de gastos', data.msg, 'error');
            console.log(data);
            categoriaGastos.push(data.categoria);
            listarCategoria(categoriaGastos)
        } catch (error) {
            console.log(error);
            console.log(error.response.data.msg);
            return await Swal.fire('Error al cargar las categorias de gastos', error.response.data.msg, 'error');
        };

    }
};

const buscarPorFechaGastos = async () => {
    try {
        const { data } = await axios.get(`${URL}gasto/forDate/${desde.value}/${hasta.value}`);
        if (!data.ok) return await Swal.fire('Error al cargar los gastos', data.msg, 'error');
        gastos = data.gastos;
    } catch (error) {
        console.log(error.response.data.msg);
        return await Swal.fire('Error al cargar los gastos', error.response.data.msg, 'error');
    }
    

    listarGastos(gastos);
};

const modificarGasto = async (e) => {
    if ('Invalid Date' == fechaUTC()) return await Swal.fire('Error al cargar un Gasto', 'Poner Una fecha', 'error');
    if (categoria.value == '') return await Swal.fire('Error al cargar el gasto', 'Falta poner un tipo de categoria', 'error');
    if (importe.value === '') return await Swal.fire('Error al cargar el gasto', 'Falta poner un importe en el gasto', 'error');
    if (descripcion.value === '') return await Swal.fire('Error al cargar el gasto', 'Falta poner una descripcion en el gasto', 'error');

    const gasto = {};

    gasto._id = modificar.id;
    gasto.fecha = fechaUTC().toISOString();
    gasto.descripcion = descripcion.value;
    gasto.cantidad = cantidad.value;
    gasto.importe = importe.value;
    gasto.total = totalInput.value;
    gasto.categoria = categoria.value;
    
    try {
        const { data } = await axios.patch(`${URL}gasto/${gasto._id}`, gasto);
        if (!data.ok) return await Swal.fire('Error al modificar el gasto', data.msg, 'error');
        const gastoUpdate = data.gastoModificado;

        gastos = gastos.map(elem => {
            if (elem._id === gastoUpdate._id) {
                return gastoUpdate
            };
    
            return elem;
        })
    
        modificar.id = '';
        fechaInput.value = '';
        descripcion.value = '';
        cantidad.value = '';
        importe.value = '';
        totalInput.value = '';
        categoria.value = '';
    
        listarGastos(gastos);
    
        modal.classList.add('none');
    } catch (error) {
        console.log(error.response.data.msg);
        return await Swal.fire('Error al modificar el gasto', error.response.data.msg, 'error');
    }



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
    cantidad.value = '';
    importe.value = '';
    totalInput.value = '';
    categoria.value = '',

        modal.classList.add('none');

});

gasto.addEventListener('click', clickGasto);
egreso.addEventListener('click', clickEgreso);

document.addEventListener('keyup', e => {
    if (e.keyCode === 27) {
        if (modal.classList.contains('none')) {
            location.href = '../menu.html';
        } else {
            modal.classList.add('none');
        }
    };
});

fechaInput.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
        descripcion.focus();
    }
});

descripcion.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
        cantidad.focus();
    }
});

cantidad.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
        importe.focus();
    }
});

importe.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        totalInput.value = (cantidad.value * importe.value).toFixed(2);
        tipo.focus();
    }
});

tipo.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        e.preventDefault();
        categoria.focus();
    }
});

categoria.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
        e.preventDefault();
        guardar.classList.contains('none') ? modificar.focus() : guardar.focus();
    }
});