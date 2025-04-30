const Seccion = require('../models/Seccion');

const initSecciones = async () => {

    try {
        const existe = await Seccion.findOne({codigo: 1});

        if(!existe){
            await Seccion.create({
                nombre: 'TODOS',
                codigo: 1
            });
            console.log('✅ Seccion TODOS creada por defecto');
        }else{
            console.log('ℹ️ Seccion TODOS Ya existe');
        }
    } catch (error) {
        console.log('❌ error al cargar la seccion por defecto: ', error);
        
    }

};


module.exports = initSecciones;