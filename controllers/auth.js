const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {  // async
    //////
    // TODO : contrôler les valeurs ( non nulles + regexp )
    //////
    bcrypt.hash(req.body.signupPassword, 10)
        .then(hash => {
            const user = User.create({
                lastname: req.body.signupLastName,
                firstname: req.body.signupFirstName,
                email: req.body.signupEmail,
                password: hash,
                avatarUrl: 'defaultavatar.jpg'
            }).then(() => {
                console.log('utilisateur enregistré');
                res.status(201).json({ message: 'utilisateur créé'});
            }).catch(error => {
                console.log('error in controllers/auth.js : ' + error);
                res.status(400).json({ error: 'erreur d\'authentification'})
            });
        })
        .catch(error => res.status(500).json({ error }));
};


exports.login = (req, res, next) => {
    User.findOne({ where: { email: req.body.loginEmail}})
        .then((userData) => {
            if(!userData) {
                return res.status(401).json({ error: 'utilisateur non trouvé '});
            }
            bcrypt.compare(req.body.loginPassword, userData.password)
                .then(valid => {
                    if(!valid) {
                        return res.status(401).json({ error: 'Password incorrect'});
                    }
                    res.status(200).json({
                        userId: userData.id,
                        userLastName: userData.lastname,
                        userFirstName: userData.firstname,
                        userAvatar: userData.avatarUrl,
                        token: jwt.sign(
                            { userId: userData.id },
                            process.env.TOKEN_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ error: error});
        })
}