const initCartaEmpanada = require('./initCartaEmpanada');
const initCliente = require('./initCliente');
const initNumeros = require('./initNumero');
const initPedido = require('./initPedido');
const initSecciones = require('./initSecciones');
const initVariable = require('./initVariable');


const runSeeders = async() => {
    try {
        await initSecciones();
    } catch (error) {
        console.error(error);
        console.log('❌ Error al inicializar las secciones');
    };

    try {
        await initCliente();
    } catch (error) {
        console.log(error);
        console.log('object ❌ Error al inicializar el cliente por defecto');
    }

    try {
        await initNumeros();
    } catch (error) {
        console.error(error);
        console.log('❌ Error al inicializar los numeros');
    };

    try {
        await initPedido();
    } catch (error) {
        console.error(error);
        console.log('❌ Error al inicializar los pedidos');
    }
    
    try {
        await initCartaEmpanada();
    } catch (error) {
        console.error(error);
        console.log('❌ Error al inicializar la carta de empanadas');
    }

    try {
        await initVariable();
    } catch (error) {
        console.log(error);
        console.log('❌ Error al inicializar la Varaible para la web');
    }
};


module.exports = runSeeders;