const Pedido = require('../models/Pedido');

const initPedido = async() => {
    try {
        const existe = await Pedido.exists({});
        if(!existe){
            await Pedido.create({
                numero: 0
            });
            console.log('✅ Pedido creado por defecto');
        }else{
            console.log('ℹ️ Pedido Ya existe');
        }
    } catch (error) {
        console.log('❌ error al cargar el pedido por defecto: ', error);
    }
};

module.exports = initPedido;