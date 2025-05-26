const { Router } = require('express');
const { getSecciones, getSeccion, deleteSeccion, postOne, getForCodigo } = require('../controllers/seccion.controllers');
const router = Router();

router.route('/')
    .get(getSecciones)
    .post(postOne)
router.route('/:id')
    .delete(deleteSeccion)
    .get(getSeccion);
router.route('/forCodigo/:codigo')
    .get(getForCodigo)

module.exports = router;