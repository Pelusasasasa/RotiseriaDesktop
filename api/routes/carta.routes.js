const { Router } = require('express');
const { getOne, patchOne } = require('../controllers/cartaEmpanada.controllers');
const router = Router();

router.route('/')
    .get(getOne)
router.route('/:id')
    .patch(patchOne)

module.exports = router;