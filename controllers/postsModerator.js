const { Post, User, Comment } = require('../models');
const { Op } = require('sequelize');

const defaultInclude = [
    {
        model: User,
        attributes: ['id', 'firstname', 'lastname', 'avatarUrl']
    },
    {
        model: Comment,
        include: [
            {
                model: User,
                attributes: ['id', 'firstname', 'lastname', 'avatarUrl']
            }
        ]
    }
];

//sends all posts marked as 'moderated'
exports.getModeratedPosts = (req, res) => {
    Post.findAll({
        where: {moderated: true},
        include: [
            {
                model: User,
                attributes: ['id', 'firstname', 'lastName', 'avatarUrl']
            },
            {
                model: Comment,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstname', 'lastname', 'avatarUrl']
                        }
                    ]
            }
        ]
    })
    .then(data => {
        for(let post of data) {
            post.reported = JSON.parse(post.reported);
        }
        res.status(200).json(data);
    }).catch(error => {
        console.log('erreur dans postsModerator/getModeratedPosts : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer.'});
    })
}

//sends all posts marked as 'reported'
exports.getReportedPosts = (req, res) => {
    Post.findAll({
        where: { reported: { [Op.ne]: '[]' }},
        include: [
            {
                model: User,
                attributes: ['id', 'firstname', 'lastName', 'avatarUrl']
            },
            {
                model: Comment,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstname', 'lastname', 'avatarUrl']
                        }
                    ]
            }
        ]
    })
    .then(data => {
        for(let post of data) {
            post.reported = JSON.parse(post.reported);
        }
        res.status(200).json(data);
    }).catch(error => {
        console.log('erreur dans postsModeratorCtrl.getReportedPosts : ' + error);
        res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer.'});
    })
}

//clears the list of users who have reported the post
exports.unreportPost = (req, res) => {
    Post.findOne({where: { id: req.body.postId}}).then(post => {
        if(!post)
            return res.status(404).json({ message: 'Post non trouvé.' });
        Post.update({reported: '[]'}, {where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            Post.findOne({where: { id: req.body.postId}, include: defaultInclude})
            .then(post => {
                delete post.User.dataValues.password;
                post.reported = JSON.parse(post.reported);
                res.status(201).json({ message: "Signalement annulé.", newPost: post});
            }).catch(error => {
                console.log('Erreur dans postModeratorCtrl.unreportPost :');
                console.log(error);
                res.status(500).json({ message: 'Une erreur est survenue, veuiller rafraîchir la page.'});
            })
        }).catch(error => {
            console.log('Erreur dans postCtrl.unreportPost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    });
}

//sets the given post ( req.body.postId ) as 'moderated', sets the reason for moderation ( reasonForModeration property ) and clears the list of users who have reported the post
exports.moderatePost = (req, res) => {
    // control req.body.reason ( musn't be null or undefined or )
    if(!req.body.reason)
        return res.status(400).json({message: 'Vous devez indiquer un motif pour la modération'});
    Post.update({moderated: 1, reasonForModeration: req.body.reason, reported: '[]'}, {where: {id: req.body.postId}}).then(() => {
        console.log('Post mis à jour');
        Post.findOne({where: { id: req.body.postId}, include: defaultInclude}).then(post => {
            post.reported = JSON.parse(post.reported);
            res.status(201).json({ message: 'Post mis à jour', newPost: post});
        }).catch(error => {
            console.log('Erreur dans postModeratorCtrl.moderatePost :');
            console.log(error);
            res.status(500).json({ message: 'Une erreur est survenue, veuiller rafraîchir la page.', newPost: null});
        })
    }).catch(error => {
        console.log('error in postsModerator.js :\n' + error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour. Veuillez réessayer', newPost: null});
    })
}

//unsets the given post ( req.body.postId ) as 'moderated', clears the reasonForModeration, corrected and reported properties
exports.unmoderatePost = (req, res) => {
    Post.update({moderated: 0, reasonForModeration: null, corrected: false, reported: '[]'}, {where: {id: req.body.postId}}).then(() => {
        Post.findOne({where: { id: req.body.postId}, include: defaultInclude}).then(post => {
            post.reported = JSON.parse(post.reported);
            res.status(201).json({ message: 'Post mis à jour', newPost: post});
        }).catch(error => {
            console.log('Erreur dans postModeratorCtrl.moderatePost :');
            console.log(error);
            res.status(500).json({ message: 'Une erreur est survenue, veuiller rafraîchir la page.'});
        })
    }).catch(error => {
        console.log('Error in postsModerator.js :\n' + error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour. Veuillez réessayer'});
    })
}