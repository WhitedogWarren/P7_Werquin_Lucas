const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        //console.log(req.headers.authorization);
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        //console.log('userId : ' + userId);
        req.auth = { userId };
        if(req.body.userId && req.body.userId !== userId) {
            throw 'invalid user Id';
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};