const { ipcRenderer } = require("electron");


const tbody = document.getElementById('tbody');
const desde = document.getElementById('desde');
const hasta = document.getElementById('hasta');

let facturas;

const cargarPagina = async() => {

    const date = new Date().toISOString();
    desde.value = date.slice(0,10);
    hasta.value = date.slice(0,10);

    facturas = JSON.parse(await ipcRenderer.invoke('get-facturas', {
        desde: desde.value,
        hasta: hasta.value
    }));

    listarFacturas(facturas)
};

const imprimirTicket = async(e) => {
    const id = e.target.parentNode.parentNode.id;

    const venta = facturas.find(e => e._id === id);
    const cliente = JSON.parse(await ipcRenderer.invoke('get-cliente', venta.idCliente));
    ipcRenderer.send('imprimir', [venta, cliente]);
}

const listarFacturas = (lista) => {

    for (let elem of lista){
        const tr = document.createElement('tr');

        tr.id = elem._id;

        tr.classList.add('cursor-pointer');
        tr.classList.add('hover-bg-gray');

        const tdFecha = document.createElement('td');
        const tdCliente = document.createElement('td');
        const tdTipo = document.createElement('td');
        const tdNumero = document.createElement('td');
        const tdPrecio = document.createElement('td');
        const tdReimprmir = document.createElement('td');

        tdFecha.innerText = elem.fecha.slice(0,10).split('-', 3).reverse().join('/');;
        tdCliente.innerText = elem.cliente;
        tdTipo.innerText = elem.tipo_comp;
        tdNumero.innerText = elem.afip.puntoVenta.padStart(4, '0') + '-' + elem.afip.numero.toString().padStart(8, '0');
        tdPrecio.innerText = elem.precio.toFixed(2);
        tdReimprmir.innerHTML = `
            <button>Re Imprimir</button>
        `;

        tdPrecio.classList.add('text-end');
        
        tdFecha.classList.add('border');
        tdCliente.classList.add('border');
        tdTipo.classList.add('border');
        tdNumero.classList.add('border');
        tdPrecio.classList.add('border');
        tdReimprmir.classList.add('border');

        tdReimprmir.classList.add()

        tdReimprmir.addEventListener('click', imprimirTicket);


        tr.appendChild(tdFecha);
        tr.appendChild(tdCliente);
        tr.appendChild(tdTipo);
        tr.appendChild(tdNumero);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdReimprmir);

        tbody.appendChild(tr);
    };

};

window.addEventListener('load', cargarPagina);

desde.addEventListener('keypress', e => {
    if(e.keyCode === 13){
        hasta.focus();
    }
});
