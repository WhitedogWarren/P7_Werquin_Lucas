const { Post, User } = require('../models');
const fs = require('fs');

exports.getUser = (req, res) => {
    User.findOne({ where: {id: req.params.id}, include: [Post]})
        .then(user => {
            let userInfo = {
                id: user.id,
                lastname: user.lastname,
                firstname: user.firstname,
                avatar: user.avatarUrl,
                bio: user.bio,
                role: user.role,
                posts: user.Posts
            }
            res.status(200).json({userInfo});
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ message: 'une erreur est survenue'});
        })
}

exports.getUserList = (req, res, next) => {
    User.findAll()
    .then((userList) => {
        //console.log(userList);
        res.status(200).json({userList});
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({ message: 'une erreur est survenue'});
    })
}

exports.updateUser = (req, res, next) => {
    User.findOne({ where: {id: req.auth.userId}}).then(user => {
        if(!user)
            return res.status(404).json({ error: new Error('Utilisateur non trouvé')});
        
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
                    User.findOne({where: {id: req.auth.userId}}).then(newUserData => {
                        res.status(200).json({
                            userId: newUserData.id,
                            userLastName: newUserData.lastname,
                            userFirstName: newUserData.firstname,
                            userAvatar: newUserData.avatarUrl,
                            userBio: newUserData.bio,
                            userRole: newUserData.role
                        })
                    })
                })
                .catch(err => {
                    res.status(400).json({ error: err.message});
            })
        }
        


        if(req.file && user.avatarUrl !== 'defaultavatar.jpg') {
            fs.unlink(`images/avatars/${user.avatarUrl}`, () => {
                updateProcess();
            });
        }
        else
        updateProcess();
    })
    .catch(err => {
        res.status(400).json({ error: err.message});
    })
}

exports.changeUserRole = (req, res, next) => {
    console.log('chagement de rôle demandé');
    console.log(req.body);
    User.findOne({ where: {id: req.auth.userId}}).then((requester) => {
        if(!requester) {
            return res.status(404).json({ error: new Error('Utilisateur non trouvé')});
        }

        if(requester.role !== 'admin')
            return res.status(400).json({ error: new Error('Requête non autorisée')});
        
        User.update({role: req.body.postedNewRole}, {where: {id: req.body.editedUser}}).then(() => {
            console.log('user mis à jour');
            res.status(200).json({ message: 'utilisateur mis à jour'});
        }).catch(error => {
            res.status(500).json({ error: new Error('Une erreur est survenue')});
        })
        
    }).catch(error => {
        res.status(500).json({ error: new Error('Une erreur est survenue')});
    })
}