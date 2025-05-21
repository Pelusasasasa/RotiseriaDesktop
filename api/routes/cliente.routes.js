const { Router } = require('express');
const { postOne, getClientes, getCliente } = require('../controllers/cliente.controllers');
const router = Router()

router.route('/')
    .get(getClientes)
    .post(postOne);
router.route('/:id')
    .get(getCliente)

module.exports = router;