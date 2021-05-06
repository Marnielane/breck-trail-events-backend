const { TransformQuery } = require('@graphql-tools/wrap');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; //Bearer token
    if (!token || token === '') {
        req.isAuth = false
        return next()
    }
    let decodedToken
    try {
        docodedToken = jwt.verify(token, 'somesupersecretkey')
    } catch (err) {
        req.isAuth = false
        return next()
    }
    if (!decodedToken) {
        req.isAuth = false
        return next()
    }
    req.isAuth = true 
    req.userId = decodedToken.userId
    next()
}