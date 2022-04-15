const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.js');

const authCtrl = require('../controllers/auth');

router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.get('/me', auth, authCtrl.getUserInfo);

module.exports = router;