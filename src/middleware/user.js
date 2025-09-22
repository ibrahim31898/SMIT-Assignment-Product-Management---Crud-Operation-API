const jwt = require('jsonwebtoken');
const { User } = require('../model/user');
require('dotenv').config();

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided. Please login first.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user in database
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authentication error.',
                error: error.message
            });
        }
    }
};

// Optional: Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please authenticate first.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

module.exports = { 
    userAuth, 
    authorize 
};