const { Post, User, Comment } = require('../models');
const fs = require('fs');
const bcrypt = require('bcrypt');

exports.getUser = (req, res) => {
    User.findOne({ 
        where: {id: req.params.id},
        include: [
            {
                model: Post,
                include: [
                    {
                        model: Comment,
                        include: [
                            {model: User, attributes: ['id', 'firstname', 'lastname', 'avatarUrl']}
                        ]
                    }
                ]
            },
            {
                model: Comment,
                include: [
                    {
                        model: Post,
                        include: [
                            {model: User, attributes: ['id', 'firstname', 'lastname', 'avatarUrl']},
                            {
                                model: Comment,
                                include: [{model: User, attributes: ['id', 'firstname', 'lastname', 'avatarUrl']}]
                            }

                        ]
                    }
                ]
            }
        ]
    })
    .then(user => {
        let userInfo = {
            id: user.id,
            lastname: user.lastname,
            firstname: user.firstname,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            role: user.role,
            posts: user.Posts,
            comments: user.Comments
        }
        for(let post of user.Posts) {
            post.reported = JSON.parse(post.reported);
        }
        for(let comment of user.Comments) {
            comment.Post.reported = JSON.parse(comment.Post.reported);
        }
        res.status(200).json(userInfo);
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({ message: 'une erreur est survenue'});
    })
}

exports.getUserList = (req, res, next) => {
    User.findAll({
        attributes: ['id', 'firstname', 'lastname', 'avatarUrl', 'role']
    })
    .then((userList) => {
        res.status(200).json(userList);
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({ message: 'une erreur est survenue'});
    })
}

exports.updateUser = (req, res, next) => {
    //////
    // check for empty fields. Add them in an emptyFields array if any
    //////
    let emptyFields = false;
    let invalidFields = false;
    if(req.body.lastname == '' || req.body.lastname == undefined || req.body.lastname == null)
        emptyFields = ['lastname'];
    if(req.body.firstname == '' || req.body.lastname == undefined || req.body.lastname == null)
        emptyFields ? emptyFields.push('firstname') : emptyFields = ['firstname'];
    //////
    // check for invalid fields. Add them in an invalidFields array if any
    //////
    const nameRegexp = /[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð.' -]+$/u;
    if(req.body.lastname !== '' && !nameRegexp.test(req.body.lastname))
        invalidFields = ['lastname'];
    if(req.body.firstname !== '' && !nameRegexp.test(req.body.firstname))
        invalidFields ? invalidFields.push('firstname') : invalidFields = ['firstname'];

    if(emptyFields || invalidFields) {
        return res.status(401).json({message : {emptyFields, invalidFields}, newUser: null});
    }
    let newPassword = false;
    User.findOne({ where: {id: req.auth.userId}}).then(user => {
        if(!user) {
            return res.status(404).json({message: 'utilisateur non trouvé', newUser: null});
        }
        if(req.auth.userId !== user.id) {
            return res.status(401).json({message: 'requête non autorisée', newUser: null})
        }
        //////
        // - at first, check if a new password is submitted ( then controls the actual password, and if new password and its confirmation are equal )
        // - then, manage file for avatar
        // - finally, update
        //////
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
                        res.status(200).json(newUserData);
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
        // check if a new password is asked, and then procced to file management and update proccess
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
    if(!req.params.id || parseInt(req.params.id) !== req.auth.userId) {
        return res.status(401).json({message : 'requête non autorisée'});
    }
    User.findOne({where: {id: req.auth.userId}}).then(user => {
        if(!user)
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        User.destroy({where: {id: req.auth.userId}}).then(() => {
            //Post.destroy({where: {UserId: req.auth.userId}});
            res.status(201).json({message: 'Compte supprimé', newUser: null});
        }).catch(error => {
            console.log('Error in userCtrl.deleteUser : '+ error);
            res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer'});
        })
    }).catch(error => {
        console.log('Erreur in userCtrl.deleteUser : ' + error);
        res.status(500).json({message: 'Une erreur est survenue, veuillez réessayer'});
    })
}