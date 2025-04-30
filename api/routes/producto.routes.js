const { Router } = require('express');
const { getAll } = require('../controllers/producto.controllers');

const router = Router();

router.route('/')
    .get(getAll);

module.exports = router;
