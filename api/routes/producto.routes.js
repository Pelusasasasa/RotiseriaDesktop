const { Router } = require('express');
const { getAll, patchPrecio } = require('../controllers/producto.controllers');

const router = Router();

router.route('/')
    .get(getAll);
router.route('/precio/:id')
    .patch(patchPrecio)

module.exports = router;
