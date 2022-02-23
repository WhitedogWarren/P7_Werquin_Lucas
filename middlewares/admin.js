const { User } = require('../models');

module.exports = (req, res, next) => {
    User.findOne({ where: { id: req.auth.userId}}).then(user => {
        if(user.role == 'admin')
            next();
        else
            res.status(401).json({ error: new Error('Requête non autorisée')});
    }).catch(error => {
        console.log(error);
        res.status(500).json({ error: new Error('Une erreur est survenue, veuillez réessayer')});
    })
}