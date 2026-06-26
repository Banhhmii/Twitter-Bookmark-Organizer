const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function generateToken(user) {
    return jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { algorithm: 'HS256' ,expiresIn: '15m' });
};

// Middleware to authenticate user to access api endpoints
function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token missing' });
    }
    // Validate SECRET_ACCESS_TOKEN exists
    if (!process.env.SECRET_ACCESS_TOKEN) {
        console.error("CRITICAL: SECRET_ACCESS_TOKEN not configured");
        return res.status(500).json({ success: false, error: 'Server configuration error' });
    }
    
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
        if (err) {
            // Differentiate between token expired and invalid token
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                    expiredAt: err.expiredAt
                });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ 
                    success: false,
                    error: 'Invalid access token',
                    code: 'INVALID_TOKEN'
                });
            } else {
                return res.status(403).json({ 
                    success: false,
                    error: 'Token verification failed',
                    code: 'TOKEN_ERROR'
                });
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