const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

const userAdminCtrl = require('../controllers/userAdmin');

router.post('/changerole', auth, admin, userAdminCtrl.changeUserRole);

module.exports = router;