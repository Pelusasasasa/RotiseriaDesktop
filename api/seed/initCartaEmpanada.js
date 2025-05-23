const CartaEmpanada = require('../models/CartaEmpanada');

const initCartaEmpanada = async() => {
    try {
        const existe = await CartaEmpanada.findOne();

        if(!existe){
            await CartaEmpanada.create({
                docena: 0,
                mediaDocena: 0
            });

            console.log('✅ Carta de empanadas creada por defecto');
        }else{
            console.log('ℹ️ Carta de empanadas ya existe');
        }
    } catch (error) {
        console.log('❌ error al cargar la carta de empanadas por defecto: ', error);
    }
};


module.exports = initCartaEmpanada;