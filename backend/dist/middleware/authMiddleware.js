"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitAuth = exports.requireOwnership = exports.requireAnyRole = exports.requireRole = exports.optionalAuth = exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
/**
 * Middleware to authenticate requests using Firebase tokens
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
            return;
        }
        // Verify the token using the auth service
        const user = await authService_1.authService.verifyToken(token);
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to optionally authenticate requests
 * If token is present, verify it, but don't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        if (token) {
            try {
                const user = await authService_1.authService.verifyToken(token);
                req.user = user;
            }
            catch (error) {
                // Token is invalid, but we don't fail the request
                console.warn('Optional auth failed:', error);
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue even if there's an error
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Middleware to check if user has specific role
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const userRole = req.user.customClaims?.role;
            if (userRole !== requiredRole) {
                res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${requiredRole}`,
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Role check middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
};
exports.requireRole = requireRole;
/**
 * Middleware to check if user has any of the specified roles
 */
const requireAnyRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const userRole = req.user.customClaims?.role;
            if (!roles.includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: `Access denied. Required roles: ${roles.join(', ')}`,
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Role check middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
};
exports.requireAnyRole = requireAnyRole;
/**
 * Middleware to check if user can access their own resources
 */
const requireOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const resourceUserId = req.params[userIdParam];
            const currentUserId = req.user.uid;
            // Allow if user is accessing their own resource or if they're an admin
            if (resourceUserId !== currentUserId && req.user.customClaims?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own resources.',
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Ownership check middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
};
exports.requireOwnership = requireOwnership;
/**
 * Middleware to rate limit authentication attempts
 */
const rateLimitAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000 // 15 minutes
) => {
    const attempts = new Map();
    return (req, res, next) => {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        // Clean up expired entries
        for (const [ip, data] of attempts.entries()) {
            if (now > data.resetTime) {
                attempts.delete(ip);
            }
        }
        const clientAttempts = attempts.get(clientIp);
        if (clientAttempts) {
            if (clientAttempts.count >= maxAttempts) {
                res.status(429).json({
                    success: false,
                    message: 'Too many authentication attempts. Please try again later.',
                    retryAfter: Math.ceil((clientAttempts.resetTime - now) / 1000),
                });
                return;
            }
            clientAttempts.count++;
        }
        else {
            attempts.set(clientIp, {
                count: 1,
                resetTime: now + windowMs,
            });
        }
        next();
    };
};
exports.rateLimitAuth = rateLimitAuth;
//# sourceMappingURL=authMiddleware.js.map