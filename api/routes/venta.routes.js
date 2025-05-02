const { Router } = require('express');
const { postOne } = require('../controllers/venta.controllers');

const router = Router();

router.route('/')   
    .post(postOne)

module.exports = router;