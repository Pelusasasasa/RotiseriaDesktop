const { Router } = require('express');
const { getCategorias, postCategoria } = require('../controllers/categoriaGasto.controllers');

const router = Router();

router.route('/')
    .get(getCategorias)
    .post(postCategoria);


module.exports = router;