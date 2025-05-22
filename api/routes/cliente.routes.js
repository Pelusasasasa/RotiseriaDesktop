const { Router } = require('express');
const { postOne, getClientes, getCliente, getForFilter, updateCliente, getForTelefono } = require('../controllers/cliente.controllers');
const { deleteOne } = require('../models/Cliente');
const router = Router()

router.route('/')
    .get(getClientes)
    .post(postOne);
router.route('/:id')
    .get(getCliente)
    .delete(deleteOne)
    .patch(updateCliente)
router.route('/forText/:text')
    .get(getForFilter)
router.route('/forTelefono/:telefono')
    .get(getForTelefono)

module.exports = router;