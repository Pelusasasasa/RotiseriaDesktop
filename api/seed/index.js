const initCartaEmpanada = require('./initCartaEmpanada');
const initNumeros = require('./initNumero');
const initPedido = require('./initPedido');
const initSecciones = require('./initSecciones');


const runSeeders = async() => {
    try {
        await initSecciones();
    } catch (error) {
        console.error(error);
        console.log('❌ Error al inicializar las secciones');
    };

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
};


module.exports = runSeeders;