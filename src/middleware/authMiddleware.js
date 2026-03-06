import { supabase } from '../config/supabase.js';

const authMiddleware = async (req, res, next) => {
    return verifyToken(req, res, next);
};

/**
 * Middleware to verify JWT token from Supabase
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Attach user to request object
        req.user = data.user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user's email is verified
 */
const requireEmailVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    if (!req.user.email_confirmed_at) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email address first'
        });
    }

    next();
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue without user
            return next();
        }

        const token = authHeader.replace('Bearer ', '');

        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data.user) {
            req.user = data.user;
            req.token = token;
        }

        next();
    } catch (error) {
        // If optional auth fails, continue without user
        next();
    }
};

export {
    authMiddleware,
    verifyToken,
    requireEmailVerified,
    optionalAuth
};
