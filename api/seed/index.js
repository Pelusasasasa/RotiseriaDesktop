const initNumeros = require('./initNumero');
const initSecciones = require('./initSecciones');


const runSeeders = async() => {
    await initSecciones();
    await initNumeros();
};


module.exports = runSeeders;