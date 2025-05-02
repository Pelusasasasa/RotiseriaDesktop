const Numero = require('../models/Numero');

const initNumeros = async () => {
    
    try {
        const existe = await Numero.findOne({});

        if(!existe){

            await Numero.create({
                "Cuenta Corriente": 0,
                Contado: 0,
                Recibo: 0,
                Presupuesto: 0,
                Dolar: 0
            });
            console.log("✅ Numeros creados por defecto")
        }else{
            console.log("ℹ️ Numeros ya existen")
        };
    } catch (error) {

      console.error("❌ error al cargar los numeros por defecto: ", error);  
    }
};

module.exports = initNumeros;