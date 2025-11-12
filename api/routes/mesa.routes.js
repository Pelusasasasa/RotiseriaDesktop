const { Router } = require('express');
const router = Router();

const { getMesas, getMesasAbiertas, postMesa, putMesa, deleteOne, abrirMesa, getMesa } = require('../controllers/mesa.controllers');

router.route('/')
    .get(getMesas)
    .post(postMesa);

router.route('/abierto')
    .get(getMesasAbiertas)

router.route('/:id')
    .get(getMesa)
    .patch(abrirMesa)
    .put(putMesa)
    .delete(deleteOne);


module.exports = router;