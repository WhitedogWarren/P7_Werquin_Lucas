const { Post, User } = require('../models');

exports.getContent = (req, res, next) => {
    const posts = Post.findAll({include: [User]})
    .then(data => {
        res.status(200).json(data);
    })
    .catch(error => {
        console.log('error in controllers/home.js : ' + error);
        res.status(400).json({ erreur: error.message});
    });
}