const { Post, User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {  // async
    //////
    // TODO : contrôler les valeurs ( non nulles + regexp )
    //////
    let emptyFields = false;
    if(req.body.signupLastName == '' || !req.body.signupLastName)
        emptyFields = ['lastname'];
    if(req.body.signupFirstName == '' || !req.body.signupFirstName)
        emptyFields ? emptyFields.push('firstname') : emptyFields = ['firstname'];
    if(req.body.signupEmail == '' || !req.body.signupEmail)
        emptyFields ? emptyFields.push('email') : emptyFields = ['email'];
    if(req.body.signupPassword == '' || !req.body.signupPassword)
        emptyFields ? emptyFields.push('password') : emptyFields = ['password'];
    
    const nameRegexp = /[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð.' -]+$/u;
    const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z\+\-\/\=\!@_&\*]{8,}$/;
    let invalidFields = false;
    
    if(req.body.signupLastName !== '' && !nameRegexp.test(req.body.signupLastName))
        invalidFields = ['lastname'];
    if(req.body.signupFirstName !== '' && !nameRegexp.test(req.body.signupFirstName))
        invalidFields ? invalidFields.push('firstname') : invalidFields = ['firstname'];
    if(req.body.signupEmail !== '' && !emailRegExp.test(req.body.signupEmail))
        invalidFields ? invalidFields.push('email') : invalidFields = ['email'];
    if(req.body.signupPassword !== '' && !passwordRegExp.test(req.body.signupPassword))
        invalidFields ? invalidFields.push('password') : invalidFields = ['password'];

    if(emptyFields || invalidFields)
        return res.status(401).json({message: 'Formulaire non valide', emptyFields, invalidFields});

    bcrypt.hash(req.body.signupPassword, 10)
        .then(hash => {
            const user = User.create({
                lastname: req.body.signupLastName,
                firstname: req.body.signupFirstName,
                email: req.body.signupEmail,
                password: hash,
                avatarUrl: 'defaultavatar.jpg',
                role: 'user'
            }).then(() => {
                console.log('utilisateur enregistré');
                res.status(201).json({ message: 'utilisateur créé'});
            }).catch(error => {
                console.log('error in controllers/auth.js :');
                console.log(error);
                res.status(400).json({ message: 'erreur lors de la création du compte. Veuillez réessayer' });
            });
        })
        .catch(error => res.status(500).json({ error }));
};


exports.login = (req, res, next) => {
    User.findOne({ where: { email: req.body.loginEmail}, include: [Post]})
        .then((userData) => {
            if(!userData) {
                return res.status(401).json({ message: 'utilisateur non trouvé '});
            }
            bcrypt.compare(req.body.loginPassword, userData.password)
                .then(valid => {
                    if(!valid) {
                        res.status(500).json({ message: 'Password incorrect'});
                        return;
                    }
                    res.status(200).json({
                        message: 'connexion réussie',
                        newUser: {
                            id: userData.id,
                            lastname: userData.lastname,
                            firstname: userData.firstname,
                            avatarUrl: userData.avatarUrl,
                            bio: userData.bio,
                            //Posts: userData.Posts,
                            role: userData.role,
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt
                        },
                        token: jwt.sign(
                            { userId: userData.id },
                            process.env.TOKEN_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => {
                    console.log('Erreur dans middlewares/auth.js :');
                    console.log(error);
                    res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer.' });
                });
        })
        .catch(error => {
            console.log('Erreur dans middlewares/auth.js :');
            console.log(error);
            res.status(400).json({ message: 'Une erreur est survenue, veuillez réessayer.' });
        })
}

exports.getUserInfo = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    
    if(!userId)
        return res.status(404).json({message: 'Une erreur est survenue, veuillez réessayer'});
    User.findOne({where: {id: userId}}).then(user => {
        delete user.dataValues.password;
        res.status(200).json(user);
    }).catch(error =>  {
        console.log('Erreur dans controllers/auth/getUserInfo : ' + error);

    })
}