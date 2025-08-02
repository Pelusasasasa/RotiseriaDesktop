const { Router } = require('express');
const multer = require('multer');
const { getAll, patchPrecio, getOne, postOne, deleteOne, getForSeccion, descontarStock, patchOne, getForSeccionAndDescription } = require('../controllers/producto.controllers');
const { cloudinary } = require('../helpers/cargarImagenCloudinary');

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'imgProductos');
        },
        filename:(req, file, cb) => {
            const id = req.body._id || 'default'
            cb(null, `${id}.png`)
        }
    });

const upload = multer({storage});
const router = Router();

router.route('/')
    .get(getAll)
    .post(upload.single('imagen'), postOne)
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
    .patch(upload.single('imagen'), patchOne)



module.exports = router;
