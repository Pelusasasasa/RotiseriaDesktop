const { Router } = require('express');
const { getGastos, postOne, patchOne, deleteOne, getGastosForDate } = require('../controllers/gasto.controllers');
const router = Router();

router.route('/')
    .get(getGastos)
    .post(postOne)
router.route('/forDate/:desde/:hasta')
    .get(getGastosForDate)
router.route('/:id')
    .patch(patchOne)
    .delete(deleteOne)

module.exports = router;