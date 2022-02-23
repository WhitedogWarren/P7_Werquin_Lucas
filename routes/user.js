const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const userCtrl = require('../controllers/user');

router.post('/', auth, multer, userCtrl.updateUser);
router.get('/', auth, userCtrl.getUserList);
router.get('/:id', auth, userCtrl.getUser);

//router.post('/changerole', auth, userCtrl.changeUserRole);

module.exports = router;