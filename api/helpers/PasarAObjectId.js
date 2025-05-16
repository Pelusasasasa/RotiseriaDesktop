const mongoose = require('mongoose');
const Producto = require('../models/Producto');

async function convertirIds() {
  try {
    // 1. Encontrar todos los documentos
    const documentos = await Producto.find({});

    console.log(`📊 Total documentos: ${documentos.length}`);

    // 2. Actualizar solo los documentos con seccion válida
    let actualizados = 0;
    const errores = [];

    for (const doc of documentos) {
      try {
        if (doc.seccion && mongoose.isValidObjectId(doc.seccion)) {
          const nuevoId = new mongoose.Types.ObjectId(doc.seccion);
          
          // Actualización directa en la base de datos (más eficiente que save())
          await Producto.updateOne(
            { _id: doc._id },
            { $set: { seccion: nuevoId } }
          );
          actualizados++;
        }
      } catch (error) {
        errores.push({
          id: doc._id,
          seccion: doc.seccion,
          error: error.message
        });
      }
    }

    console.log(`✅ ${actualizados} documentos actualizados`);
    console.log(`❌ ${errores.length} errores`);
    if (errores.length > 0) {
      console.table(errores);
    }

  } catch (error) {
    console.error('Error general:', error);
  }
};

module.exports = convertirIds;