const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        req.auth = { userId };
        if(req.body.userId && req.body.userId !== userId) {
            throw 'invalid user Id';
        } else {
            next();
        }
    } catch(err) {
        if(err.message == 'jwt expired')
            res.status(401).json({
                message: 'jwt expired'
            });
        else
            res.status(401).json({
                message: 'requête non valide'
            });
    }
};