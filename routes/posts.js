const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const postCtrl = require('../controllers/posts');

router.post('/', auth, postCtrl.createPost);

module.exports = router;