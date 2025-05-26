const { Router } = require('express');
const { getAll, postOne } = require('../controllers/variable.controllers');
const router = Router();

router.route('/')
    .get(getAll)
    .post(postOne);

module.exports = router;