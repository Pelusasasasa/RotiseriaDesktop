const { Router } = require('express');
const router = Router();

const { getOne, postOne, patchOne } = require('../controllers/numero.controllers');

router.route('/')
    .get(getOne)
    .patch(patchOne)
    .post(postOne);

module.exports = router;