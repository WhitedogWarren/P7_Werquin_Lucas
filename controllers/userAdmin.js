const { User, Post } = require('../models');

exports.changeUserRole = (req, res) => {
    User.findOne({ where: {id: req.auth.userId}}).then((requester) => {
        if(!requester) {
            return res.status(404).json({ error: new Error('Utilisateur non trouvé')});
        }
        if(requester.role !== 'admin') {
            return res.status(400).json({ error: new Error('Requête non autorisée')});
        }
        User.update({role: req.body.postedNewRole}, {where: {id: req.body.editedUser}}).then(() => {
            console.log('update done');
            User.findOne({where: {id: req.body.editedUser}, include: [Post]}).then(user => {
                let userInfo = {
                    id: user.dataValues.id,
                    lastname: user.dataValues.lastname,
                    firstname: user.dataValues.firstname,
                    avatar: user.dataValues.avatarUrl,
                    bio: user.dataValues.bio,
                    role: user.dataValues.role,
                    posts: user.dataValues.Posts
                }
                res.status(200).json({ message: 'Utilisateur mis à jour', newUser: userInfo});
            }).catch(error => {
                console.log('Erreur dans userCtrl.changeUserRole :');
                console.log(error);
                res.status(500).json({ message: 'Une erreur est survenue, veuillez rafraîchir la page.'});
            })
        }).catch(error => {
            res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer.' });
        })
    }).catch(error => {
        res.status(500).json({ error: new Error('Une erreur est survenue')});
    })
}