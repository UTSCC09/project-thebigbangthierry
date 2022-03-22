const jwt = require('jsonwebtoken');


const Authentication = function (req, res, next) {
    console.log(req);

    const header = req.get('Authorization');
    if (!header) {
        req.isAuth = false;
        return next();
    }
    const token = header.split(' ')[1];
    if (!token || token === '') {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JSON_SECRET);
    } catch (err) {
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.username = decodedToken.username;
    next();
}

module.exports = Authentication;