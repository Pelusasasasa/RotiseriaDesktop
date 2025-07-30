const { Router } = require('express');
const { traerVentasAtlas } = require('../controllers/ventaAtlas.controllers');
const router = Router();


router.route('/pasado')
    .get(traerVentasAtlas)


module.exports = router;