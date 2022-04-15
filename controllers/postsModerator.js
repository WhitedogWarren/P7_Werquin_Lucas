const { Post, User } = require('../models');
const { Op } = require('sequelize');

exports.getModeratedPosts = (req, res) => {
    Post.findAll({where: {moderated: true}, include: [User]}).then(data => {
        for(let post of data) {
            delete post.User.dataValues.password;
            post.reported = JSON.parse(post.reported);
        }
        res.status(200).json(data);
    }).catch(error => {
        console.log('erreur dans postsModerator/getModeratedPosts : ' + error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer.'});
    })
}

exports.getReportedPosts = (req, res) => {
    Post.findAll({ where: { reported: { [Op.ne]: '[]' }}, include: [User]}).then(data => {
        for(let post of data) {
            delete post.User.dataValues.password;
            post.reported = JSON.parse(post.reported);
        }
        res.status(200).json(data);
    }).catch(error => {
        console.log('erreur dans postsModeratorCtrl.getReportedPosts : ' + error);
        res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer.'});
    })
}

exports.unreportPost = (req, res) => {
    Post.findOne({where: { id: req.body.postId}}).then(post => {
        if(!post)
            return res.status(404).json({ message: 'Post non trouvé.' });
        Post.update({reported: '[]'}, {where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            Post.findOne({where: { id: req.body.postId}, include: [User]}).then(post => {
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

exports.moderatePost = (req, res) => {
    // contrôler reasonForModeration ( non nul )
    if(req.body.reason == '')
        return res.status(400).json({message: 'Vous devez indiquer un motif pour la modération'});
    Post.update({moderated: 1, reasonForModeration: req.body.reason, reported: '[]'}, {where: {id: req.body.postId}}).then(() => {
        console.log('Post mis à jour');
        Post.findOne({where: { id: req.body.postId}, include: [User]}).then(post => {
            delete post.User.dataValues.password;
            post.reported = JSON.parse(post.reported);
            res.status(201).json({ message: 'Post mis à jour', newPost: post});
        }).catch(error => {
            console.log('Erreur dans postModeratorCtrl.moderatePost :');
            console.log(error);
            res.status(500).json({ message: 'Une erreur est survenue, veuiller rafraîchir la page.'});
        })
        
    }).catch(error => {
        console.log('error in postsModerator.js :\n' + error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour. Veuillez réessayer'});
    })
}

exports.unmoderatePost = (req, res) => {
    Post.update({moderated: 0, reasonForModeration: null, corrected: false, reported: '[]'}, {where: {id: req.body.postId}}).then(() => {
        console.log('Post mis à jour');

        Post.findOne({where: { id: req.body.postId}, include: [User]}).then(post => {
            delete post.User.dataValues.password;
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

