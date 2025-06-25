"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_1 = require("../services/authService");
class AuthController {
    // User registration
    static async register(req, res) {
        try {
            // Check validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
                return;
            }
            const credentials = {
                email: req.body.email,
                password: req.body.password,
                displayName: req.body.displayName,
            };
            const user = await authService_1.authService.register(credentials);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        emailVerified: user.emailVerified,
                    },
                },
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }
    // User login
    static async login(req, res) {
        try {
            // Check validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
                return;
            }
            const credentials = {
                email: req.body.email,
                password: req.body.password,
            };
            const tokens = await authService_1.authService.login(credentials);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: tokens,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }
    // User logout
    static async logout(req, res) {
        try {
            const uid = req.user?.uid;
            if (!uid) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            await authService_1.authService.logout(uid);
            res.status(200).json({
                success: true,
                message: 'Logout successful',
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Logout failed',
            });
        }
    }
    // Password reset request
    static async requestPasswordReset(req, res) {
        try {
            // Check validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
                return;
            }
            const request = {
                email: req.body.email,
            };
            await authService_1.authService.requestPasswordReset(request);
            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
            });
        }
        catch (error) {
            console.error('Password reset error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Password reset request failed',
            });
        }
    }
    // Token refresh
    static async refreshToken(req, res) {
        try {
            // Check validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                });
                return;
            }
            const request = {
                refreshToken: req.body.refreshToken,
            };
            const tokens = await authService_1.authService.refreshToken(request);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: tokens,
            });
        }
        catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Token refresh failed',
            });
        }
    }
    // Get user profile
    static async getProfile(req, res) {
        try {
            const uid = req.user?.uid;
            if (!uid) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            const user = await authService_1.authService.getUserProfile(uid);
            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified,
                    },
                },
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get profile',
            });
        }
    }
    // Update user profile
    static async updateProfile(req, res) {
        try {
            const uid = req.user?.uid;
            if (!uid) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            const updates = {
                displayName: req.body.displayName,
                photoURL: req.body.photoURL,
            };
            const user = await authService_1.authService.updateUserProfile(uid, updates);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified,
                    },
                },
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update profile',
            });
        }
    }
    // Delete user account
    static async deleteAccount(req, res) {
        try {
            const uid = req.user?.uid;
            if (!uid) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }
            await authService_1.authService.deleteUser(uid);
            res.status(200).json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete account error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete account',
            });
        }
    }
    // Verify token endpoint
    static async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'No token provided',
                });
                return;
            }
            const user = await authService_1.authService.verifyToken(token);
            res.status(200).json({
                success: true,
                message: 'Token verified successfully',
                data: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        emailVerified: user.emailVerified,
                    },
                },
            });
        }
        catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Token verification failed',
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map