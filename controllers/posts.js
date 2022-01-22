const models = require('../models');


exports.createPost = (req, res, next) => {
    //////
    // TODO : contrôler le postedContent
    //////
    console.log(`userId for Post.create : ${req.body.user_id}`);
    const post = models.Post.create({
        UserId: req.auth.userId,
        content: req.body.content.postedContent
    }).then(() => {
        console.log('Post enregistré');
        res.status(200).json({message: 'demande de post acceptée'});
    }).catch(error => {
        console.log('error in controller/posts.js : ' + error);
        res.status(500).json({ error: error});
    });
}
