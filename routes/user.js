const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const userCtrl = require('../controllers/user');

router.get('/', auth, userCtrl.getMe);
router.post('/', auth, multer, userCtrl.updateUser);
router.get('/:id', auth, userCtrl.getUser);

module.exports = router;