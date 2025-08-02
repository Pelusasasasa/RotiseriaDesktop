const { Router } = require('express');
const { getAll, postOne, tooglePaginaWeb } = require('../controllers/variable.controllers');
const router = Router();

router.route('/')
    .get(getAll)
    .post(postOne);
router.route('/tooglePaginaWeb')
    .patch(tooglePaginaWeb);

module.exports = router;