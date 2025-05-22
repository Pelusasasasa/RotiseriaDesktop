const initNumeros = require('./initNumero');
const initPedido = require('./initPedido');
const initSecciones = require('./initSecciones');


const runSeeders = async() => {
    await initSecciones();
    await initNumeros();
    await initPedido();
};


module.exports = runSeeders;