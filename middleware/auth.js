const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { AuthError } = require("../utils/appError");

function generateToken(user) {
    return jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { algorithm: 'HS256', expiresIn: '15m' });
};

function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(new AuthError('Access token missing'));
    }
    if (!process.env.SECRET_ACCESS_TOKEN) {
        console.error("CRITICAL: SECRET_ACCESS_TOKEN not configured");
        return next(new Error('Server configuration error'));
    }

    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new AuthError('Token expired'));
            } else if (err.name === 'JsonWebTokenError') {
                return next(new AuthError('Invalid access token', 403));
            } else {
                return next(new AuthError('Token verification failed', 403));
            }
        }
        req.user = user;
        next();
    });
}

module.exports = {
    generateToken,
    authenticateUser
};
