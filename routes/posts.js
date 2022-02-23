const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const postCtrl = require('../controllers/posts');

router.get('/', auth, postCtrl.getAllPosts);
router.get('/from/:id', auth, postCtrl.getPostsFromUser);
router.post('/', auth, multer, postCtrl.createPost);
router.put('/:id', auth, multer, postCtrl.updatePost);
router.delete('/:id', auth, postCtrl.deletePost);

router.post('/report', auth, postCtrl.reportPost);
router.post('/unreport', auth, postCtrl.unreportPost);
router.post('/notify_correction', auth, postCtrl.notifyCorrection);
router.post('/avoid_correction', auth, postCtrl.avoidCorrection);

router.post('/like', auth, postCtrl.likePost);
router.post('/unlike', auth, postCtrl.unlikePost);
router.post('/love', auth, postCtrl.lovePost);
router.post('/unlove', auth, postCtrl.unlovePost);
router.post('/laugh', auth, postCtrl.laughPost);
router.post('/unlaugh', auth, postCtrl.unlaughPost);
router.post('/anger', auth, postCtrl.angerPost);
router.post('/unanger', auth, postCtrl.unangerPost);

module.exports = router;