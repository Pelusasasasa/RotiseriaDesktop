const Variable = require("../models/Variable")

const initVariable = async() => {
    try {
        const existe = await Variable.findOne();
        console.log(existe)
        if(!existe?.paginaWebAbierto){
            existe.paginaWebAbierto = true;
            await existe.save();

            console.log('✅ Variable Web creada por defecto');
        }else{
            console.log('ℹ️ Variable Web ya existe');
        }
    } catch (error) {
        console.log('❌ error al cargar Variable Web: ', error);
    }
};

module.exports = initVariable;