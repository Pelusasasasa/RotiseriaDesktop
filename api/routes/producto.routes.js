const { Router } = require('express');
const { getAll, patchPrecio, getOne, postOne, deleteOne, getForSeccion, descontarStock, patchOne, getForSeccionAndDescription } = require('../controllers/producto.controllers');

const router = Router();

router.route('/')
    .get(getAll)
    .post(postOne)
router.route('/forSeccionAndDescription/:description/:seccion')
    .get(getForSeccionAndDescription)
router.route('/precio/:id')
    .patch(patchPrecio)
router.route('/forSeccion/:seccion')
    .get(getForSeccion)
router.route('/forStock')
    .patch(descontarStock)//Falta probar
router.route('/:id')
    .get(getOne)
    .delete(deleteOne)
    .patch(patchOne)



module.exports = router;
