const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");


const tbody = document.querySelector('tbody');

const agregar = document.getElementById('agregar');
const salir = document.getElementById('salir');

const guardar = document.getElementById('guardar');
const cancelar = document.getElementById('cancelar');

const fecha = document.getElementById('fecha');
const descripcion = document.getElementById('descripcion');
const importe = document.getElementById('importe');
const categoria = document.getElementById('categoria');

let gastos = [];

const listarGastos = (lista) => {
    for(let elem of lista){
        const tr = document.createElement('tr');

        const tdDescripcion = document.createElement('td')

        tbody.appendChild(tr);
    }
}

const cargarPagina = async() => {
    gastos = JSON.parse(await ipcRenderer.invoke('get-gastos'));

    listarGastos(gastos)
};

const abrirModal = async() => {

    const modal = document.getElementById('modal');

    modal.classList.remove('none');

};

const guardarGasto = async() => {

    const gasto = {};

    gasto.fecha = fecha.value;
    gasto.descripcion = descripcion.value;
    gasto.importe = importe.value;
    gasto.categoria = categoria.value;

    console.log(gasto)

    ipcRenderer.send('post-gasto', gasto);
    gastos.push(gasto);

};

agregar.addEventListener('click', abrirModal);

guardar.addEventListener('click', guardarGasto);

salir.addEventListener('click' ,e => {
    location.href = '../menu.html'
});

cancelar.addEventListener('click', e => {

    modal.classList.add('none');

});

window.addEventListener('load', cargarPagina);


//TODO:
    //Listar los gastos