"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authService_1 = require("../services/authService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Rate limiting for authentication endpoints
const authRateLimit = (0, authMiddleware_1.rateLimitAuth)(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authRateLimit, authService_1.AuthService.validateRegister, authController_1.AuthController.register);
/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authRateLimit, authService_1.AuthService.validateLogin, authController_1.AuthController.login);
/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authMiddleware_1.authenticateToken, authController_1.AuthController.logout);
/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', authRateLimit, authService_1.AuthService.validatePasswordReset, authController_1.AuthController.requestPasswordReset);
/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', authService_1.AuthService.validateTokenRefresh, authController_1.AuthController.refreshToken);
/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authMiddleware_1.authenticateToken, authController_1.AuthController.getProfile);
/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authMiddleware_1.authenticateToken, authController_1.AuthController.updateProfile);
/**
 * @route DELETE /api/auth/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', authMiddleware_1.authenticateToken, authController_1.AuthController.deleteAccount);
/**
 * @route GET /api/auth/verify
 * @desc Verify token
 * @access Public
 */
router.get('/verify', authController_1.AuthController.verifyToken);
/**
 * @route GET /api/auth/health
 * @desc Health check for auth service
 * @access Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication service is healthy',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map