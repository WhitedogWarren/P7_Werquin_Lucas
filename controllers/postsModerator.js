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
    console.log('demande d\'annulation de signalement reçue');
    console.log(req.body);
    Post.findOne({where: { id: req.body.postId}}).then(post => {
        if(!post)
            return res.status(404).json({ message: 'Post non trouvé.' });
        Post.update({reported: '[]'}, {where: { id: req.body.postId}}).then(() => {
            console.log('Post mis à jour');
            return res.status(201).json({ message: 'Post mis à jour.' });
        }).catch(error => {
            console.log('Erreur dans postCtrl.unreportPost : ' + error);
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer'});
        })
    });
    
}

exports.moderatePost = (req, res) => {
    console.log('Modération de post demandée :');
    //////
    // TODO : contrôler reasonForModeration ( non nul )
    //////
    Post.update({moderated: 1, reasonForModeration: req.body.reason, reported: '[]'}, {where: {id: req.body.postId}}).then(() => {
        console.log('Post mis à jour');
        res.status(201).json({ message: 'Post mis à jour'});
    }).catch(error => {
        console.log('error in postsModerator.js :\n' + error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour. Veuillez réessayer'});
    })
}

exports.unmoderatePost = (req, res) => {
    console.log('demande d\'annulation de la moderation du post n°' + req.body.postId);
    Post.update({moderated: 0, reasonForModeration: null, corrected: false, reported: '[]'}, {where: {id: req.body.postId}}).then(() => {
        console.log('Post mis à jour');
        res.status(201).json({ message: 'Post mis à jour'});
    }).catch(error => {
        console.log('Error in postsModerator.js :\n' + error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour. Veuillez réessayer'});
    })
}

