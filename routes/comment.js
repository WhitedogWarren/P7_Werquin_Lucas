const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

const commentCtrl = require('../controllers/comment');

router.get('/:postId', auth, commentCtrl.getComments);
router.post('/:postId', auth, commentCtrl.createComment);
router.put('/:commentId', auth, commentCtrl.updateComment);
router.delete('/:commentId', auth, commentCtrl.deleteComment);


module.exports = router;