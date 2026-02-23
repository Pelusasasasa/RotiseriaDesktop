const Mesa = require('../models/Mesa');

mesaPorDefecto = {
  cliente: 'Consumidor Final',
  idCliente: '0',
  precio: 0,
  dispositivo: '',
  observaciones: '',
  abierto: false,
  estado: 'pendiente',
  abierto_en: new Date(),
  productos: [],
};

const reiniciarMesa = async (id) => {
  try {
    const mesaReiniciada = await Mesa.findByIdAndUpdate({ _id: id }, mesaPorDefecto, { new: true });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = reiniciarMesa;
