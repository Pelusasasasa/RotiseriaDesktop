const Cliente = require("../models/Cliente");


const initCliente = async() => {
    try {
        const existe = await Cliente.findOne({nombre: 'Consumidor Final'});

        if(!existe){
            await Cliente.create({
                _id: 1,
                nombre: 'Consumidor Final',
                telefono: '0000000000',
                direccion: 'Chajari',
                localidad: 'Chajari',
                saldo: 0,
                condicionFacturacion: 1,
                cuit: '000000000',
                condicionIva: 'Consumidor Final',
                observaciones: 'Cliente por defecto'
            });

            console.log('✅ Cliente por defecto creado');
        }else{
            console.log('ℹ️ Cliente por defecto ya existe');
        };
    } catch (error) {
        console.log('❌ error al cargar el cliente por defecto: ', error);
    }
};


module.exports = initCliente;   