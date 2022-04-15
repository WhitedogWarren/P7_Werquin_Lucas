const { Post, User } = require('../models');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
            for(let post of user.Posts) {
                post.reported = JSON.parse(post.reported);
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
        res.status(200).json({userList});
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({ message: 'une erreur est survenue'});
    })
}

exports.updateUser = (req, res, next) => {
    //////
    // contrôle des champs vides
    //////
    let emptyFields = false;
    let invalidFields = false;
    if(req.body.lastname == '' || req.body.lastname == undefined || req.body.lastname == null)
        emptyFields = ['lastname'];
    if(req.body.firstname == '' || req.body.lastname == undefined || req.body.lastname == null)
        emptyFields ? emptyFields.push('firstname') : emptyFields = ['firstname'];
    //////
    // contrôle des champs invalides
    //////
    const nameRegexp = /[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð.' -]+$/u;
    if(req.body.lastname !== '' && !nameRegexp.test(req.body.lastname))
        invalidFields = ['lastname'];
    if(req.body.firstname !== '' && !nameRegexp.test(req.body.firstname))
        invalidFields ? invalidFields.push('firstname') : invalidFields = ['firstname'];

    if(emptyFields || invalidFields) {
        return res.status(401).json({message : {emptyFields, invalidFields}});
    }
    
    let newPassword = false;
    User.findOne({ where: {id: req.auth.userId}}).then(user => {
        if(!user)
            return res.status(404).json({ error: new Error('Utilisateur non trouvé')});
        function updateProcess() {
            const userObject = req.file ?
            {
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                avatarUrl: req.file.filename,
                bio: req.body.bio
            } :
            {
                ...req.body
            };
            delete userObject.userId;
            if(newPassword)
                userObject.password = newPassword;
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
        function manageFileAndProceed() {
            if(req.file && user.avatarUrl !== 'defaultavatar.jpg') {
                fs.unlink(`images/avatars/${user.avatarUrl}`, () => {
                    updateProcess();
                });
            }
            else
            updateProcess();
        }
        //////
        // traitement de la demande de nouveau mot de passe
        //////
        if(req.body.postedCurrentPassword) {
            bcrypt.compare(req.body.postedCurrentPassword, user.password).then(valid => {
                if(!valid) {
                    return res.status(401).json({ message: 'mot de passe actuel invalide' });
                }
                if(req.body.postedNewPassword1 !== req.body.postedNewPassword2) {
                    return res.status(401).json({message: 'nouveau mot de passe et confirmation différents'});
                }
                bcrypt.hash(req.body.postedNewPassword1, 10).then(hash => {
                    newPassword = hash;
                    manageFileAndProceed();
                })
            })
        }
        else {
            manageFileAndProceed();
        }
    })
    .catch(err => {
        res.status(400).json({ error: err.message});
    })
}

exports.deleteUser = (req, res) => {
    console.log('suppression demandée par utilisateur n° ' + req.auth.userId);
    User.findOne({where: {id: req.auth.userId}}).then(user => {
        if(!user)
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        User.destroy({where: {id: req.auth.userId}}).then(() => {
            console.log('utilisateur supprimé');
            Post.destroy({where: {UserId: req.auth.userId}});
            res.status(201).json({message: 'Compte supprimé'});
        }).catch(error => {
            console.log('Error in userCtrl.deleteUser : '+ error);
            res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur in userCtrl.deleteUser : ' + error);
        res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer'});
    })
}