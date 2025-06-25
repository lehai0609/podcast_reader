import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { authenticateToken, rateLimitAuth } from '../middleware/authMiddleware';

const router = Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimitAuth(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  authRateLimit,
  AuthService.validateRegister,
  AuthController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  authRateLimit,
  AuthService.validateLogin,
  AuthController.login
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  authenticateToken,
  AuthController.logout
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  authRateLimit,
  AuthService.validatePasswordReset,
  AuthController.requestPasswordReset
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  AuthService.validateTokenRefresh,
  AuthController.refreshToken
);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get(
  '/profile',
  authenticateToken,
  AuthController.getProfile
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticateToken,
  AuthController.updateProfile
);

/**
 * @route DELETE /api/auth/account
 * @desc Delete user account
 * @access Private
 */
router.delete(
  '/account',
  authenticateToken,
  AuthController.deleteAccount
);

/**
 * @route GET /api/auth/verify
 * @desc Verify token
 * @access Public
 */
router.get(
  '/verify',
  AuthController.verifyToken
);

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

export default router;
