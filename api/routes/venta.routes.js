const { Router } = require('express');
const { postOne, getforAnio, getForMes, getForDia, getFacturas, getAll, getOne, deleteVenta, notaCreditoTrue } = require('../controllers/venta.controllers');

const router = Router();

router.route('/') 
    .get(getAll)  
    .post(postOne)
router.route('/anio/:fecha')
    .get(getforAnio)
router.route('/day/:fecha')
    .get(getForDia)
router.route('/mes/:fecha')
    .get(getForMes)
router.route('/factura')
    .get(getFacturas)
router.route('/notaCredito/:id')
    .patch(notaCreditoTrue)
router.route('/:id')
    .get(getOne)
    .delete(deleteVenta)

module.exports = router;