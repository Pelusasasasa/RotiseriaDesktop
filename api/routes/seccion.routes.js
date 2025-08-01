const { Router } = require('express');
const { getSecciones, getSeccion, deleteSeccion, postOne, getForCodigo, patchOneForCodigo } = require('../controllers/seccion.controllers');
const router = Router();

router.route('/')
    .get(getSecciones)
    .post(postOne)
router.route('/:id')
    .get(getSeccion)
router.route('/forCodigo/:codigo')
    .delete(deleteSeccion)
    .get(getForCodigo)
    .patch(patchOneForCodigo)

module.exports = router;