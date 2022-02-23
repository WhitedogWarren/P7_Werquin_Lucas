const { User } = require('../models');

exports.changeUserRole = (req, res) => {
    User.update({role: req.body.postedNewRole}, {where: {id: req.body.editedUser}}).then(() => {
        console.log('user mis à jour');
        res.status(200).json({ message: 'utilisateur mis à jour'});
    }).catch(error => {
        console.log(error);
        res.status(500).json({ error: new Error('Une erreur est survenue')});
    })
}