const { Router } = require('express');
const { getSecciones, getSeccion, deleteSeccion, postOne } = require('../controllers/seccion.controllers');
const router = Router();

router.route('/')
    .get(getSecciones)
    .post(postOne)
router.route('/:id')
    .delete(deleteSeccion)
    .get(getSeccion);

module.exports = router;