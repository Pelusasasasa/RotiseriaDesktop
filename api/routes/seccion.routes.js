const { Router } = require('express');
const { getSecciones, getSeccion } = require('../controllers/seccion.controllers');
const router = Router();

router.route('/')
    .get(getSecciones);
router.route('/:id')
    .get(getSeccion);

module.exports = router;