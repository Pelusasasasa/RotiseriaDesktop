const { Router } = require('express');
const router = Router();

const { getOne, patchPedido } = require('../controllers/pedido.controllers');

router.route('/')
    .get(getOne)
router.route('/:id')
    .patch(patchPedido)

module.exports = router;