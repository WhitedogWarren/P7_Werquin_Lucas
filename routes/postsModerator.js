const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const moderator = require('../middlewares/moderator');

const postsModeratorCtrl = require('../controllers/postsModerator');

router.get('/get_moderated_posts', auth, moderator, postsModeratorCtrl.getModeratedPosts);
router.get('/get_reported_posts', auth, moderator, postsModeratorCtrl.getReportedPosts);

router.post('/unreport', auth, postsModeratorCtrl.unreportPost);
router.post('/moderate_post', auth, moderator, postsModeratorCtrl.moderatePost);
router.post('/unmoderate_post', auth, moderator, postsModeratorCtrl.unmoderatePost);

module.exports = router;