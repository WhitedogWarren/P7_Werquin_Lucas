const User = require('../models/user');
const fs = require('fs');

exports.getMe = (req, res, next) => {
    console.log('coucou from controllers/user');
    //////
    // TODO : récupérer l'id de l'utilisateur
    //////
    res.status(200).json({ message: 'coucou from controllers/user'});
}

exports.getUser = (req, res, next) => {
    console.log('user demandé : ' + req.params.id);
    User.findOne({ where: {id: req.params.id}})
        .then(user => {
            console.log(user.avatarUrl);
            let userInfo = {
                lastname: user.lastname,
                firstname: user.firstname,
                avatar: user.avatarUrl
            }
            res.status(200).json({userInfo});
        })
}

exports.updateUser = (req, res, next) => {
    console.log('mise à jour d\'utilisateur demandée');
    User.findOne({ where: {id: req.auth.userId}}).then(user => {
        if(!user)
            res.status(404).json({ error: new Error('Sauce non trouvée')});
        function updateProcess() {
            const userObject = req.file ?
            {
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                avatarUrl: req.file.filename
            } :
            {
                ...req.body
            };
            delete userObject.userId;
            User.update(userObject, { where: {id:req.body.userId}})
                .then(() => {
                    console.log('user mis à jour');
                    res.status(200).json({
                        userId: req.auth.userId,
                        userLastName: userObject.lastname,
                        userFirstName: userObject.firstname,
                        userAvatar: req.file.filename
                    })
                })
                .catch(err => {
                    res.status(400).json({ error: err.message});
            })
        }
        if(user.dataValues.avatarUrl == 'defaultavatar.jpg')
            updateProcess();
        else {
            fs.unlink(`images/avatars/${user.avatarUrl}`, () => {
                updateProcess();
            });
        }
    })
    .catch(err => {
        res.status(400).json({ error: err.message});
    })
}