const { Router } = require('express');
const router = Router();

const { getOne, patchPedido, postOne } = require('../controllers/pedido.controllers');

router.route('/')
    .get(getOne)
    .post(postOne)
router.route('/:id')
    .patch(patchPedido)

module.exports = router;