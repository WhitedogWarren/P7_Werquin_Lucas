const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const homeCtrl = require('../controllers/home');

router.get('/', auth, homeCtrl.getContent);

module.exports = router;