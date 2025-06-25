"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const admin = __importStar(require("firebase-admin"));
const auth0_1 = require("auth0");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
class AuthService {
    auth0Management = null;
    firebaseApp = null;
    constructor() {
        this.initializeAuth0();
        this.initializeFirebase();
    }
    initializeAuth0() {
        try {
            const auth0Domain = process.env.AUTH0_DOMAIN;
            const auth0ClientId = process.env.AUTH0_CLIENT_ID;
            const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;
            if (auth0Domain && auth0ClientId && auth0ClientSecret) {
                this.auth0Management = new auth0_1.ManagementClient({
                    domain: auth0Domain,
                    clientId: auth0ClientId,
                    clientSecret: auth0ClientSecret,
                });
                console.log('Auth0 initialized successfully');
            }
            else {
                console.warn('Auth0 credentials not found in environment variables');
            }
        }
        catch (error) {
            console.error('Failed to initialize Auth0:', error);
        }
    }
    initializeFirebase() {
        try {
            const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
            const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
            const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            if (firebaseProjectId && firebasePrivateKey && firebaseClientEmail) {
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: firebaseProjectId,
                        privateKey: firebasePrivateKey,
                        clientEmail: firebaseClientEmail,
                    }),
                    projectId: firebaseProjectId,
                });
                console.log('Firebase initialized successfully');
            }
            else {
                console.warn('Firebase credentials not found in environment variables');
            }
        }
        catch (error) {
            console.error('Failed to initialize Firebase:', error);
        }
    }
    // Validation middleware
    static validateLogin = [
        (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
        (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ];
    static validateRegister = [
        (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        (0, express_validator_1.body)('displayName').optional().isLength({ min: 2, max: 50 }),
    ];
    static validatePasswordReset = [
        (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    ];
    static validateTokenRefresh = [
        (0, express_validator_1.body)('refreshToken').notEmpty(),
    ];
    // User registration
    async register(credentials) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            // Create user in Firebase
            const userRecord = await auth.createUser({
                email: credentials.email,
                password: credentials.password,
                displayName: credentials.displayName,
                emailVerified: false,
            });
            // Set custom claims for user role
            await auth.setCustomUserClaims(userRecord.uid, {
                role: 'user',
                createdAt: new Date().toISOString(),
            });
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }
    // User login with custom token
    async login(credentials) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            // Get user by email
            const userRecord = await auth.getUserByEmail(credentials.email);
            // For demo purposes, we'll create a custom token
            // In production, you'd verify the password against Auth0 or your own system
            const customToken = await auth.createCustomToken(userRecord.uid);
            // Generate refresh token
            const refreshToken = jsonwebtoken_1.default.sign({ uid: userRecord.uid, type: 'refresh' }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
            return {
                accessToken: customToken,
                refreshToken,
                expiresIn: 3600, // 1 hour
                tokenType: 'Bearer',
            };
        }
        catch (error) {
            console.error('Login error:', error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    // Logout (invalidate tokens)
    async logout(uid) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            // Revoke all refresh tokens for the user
            await auth.revokeRefreshTokens(uid);
            console.log(`User ${uid} logged out successfully`);
        }
        catch (error) {
            console.error('Logout error:', error);
            throw new Error(`Logout failed: ${error.message}`);
        }
    }
    // Password reset
    async requestPasswordReset(request) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            // Get user by email to verify they exist
            const userRecord = await auth.getUserByEmail(request.email);
            // Generate password reset link
            const resetLink = await auth.generatePasswordResetLink(request.email, {
                url: process.env.PASSWORD_RESET_URL || 'http://localhost:3000/reset-password',
                handleCodeInApp: true,
            });
            // In production, you would send this link via email
            console.log(`Password reset link for ${request.email}: ${resetLink}`);
            // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        }
        catch (error) {
            console.error('Password reset error:', error);
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }
    // Token refresh
    async refreshToken(request) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(request.refreshToken, process.env.JWT_SECRET || 'fallback-secret');
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            const auth = admin.auth(this.firebaseApp);
            // Get user to ensure they still exist
            const userRecord = await auth.getUser(decoded.uid);
            // Create new custom token
            const customToken = await auth.createCustomToken(userRecord.uid);
            // Generate new refresh token
            const newRefreshToken = jsonwebtoken_1.default.sign({ uid: userRecord.uid, type: 'refresh' }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
            return {
                accessToken: customToken,
                refreshToken: newRefreshToken,
                expiresIn: 3600,
                tokenType: 'Bearer',
            };
        }
        catch (error) {
            console.error('Token refresh error:', error);
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
    // Verify token
    async verifyToken(token) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            // Verify the token
            const decodedToken = await auth.verifyIdToken(token);
            // Get user record
            const userRecord = await auth.getUser(decodedToken.uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                customClaims: decodedToken,
            };
        }
        catch (error) {
            console.error('Token verification error:', error);
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
    // Get user profile
    async getUserProfile(uid) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            const userRecord = await auth.getUser(uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                customClaims: userRecord.customClaims,
            };
        }
        catch (error) {
            console.error('Get user profile error:', error);
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }
    // Update user profile
    async updateUserProfile(uid, updates) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            const updateData = {};
            if (updates.email)
                updateData.email = updates.email;
            if (updates.displayName)
                updateData.displayName = updates.displayName;
            if (updates.photoURL)
                updateData.photoURL = updates.photoURL;
            const userRecord = await auth.updateUser(uid, updateData);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                customClaims: userRecord.customClaims,
            };
        }
        catch (error) {
            console.error('Update user profile error:', error);
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
    }
    // Delete user account
    async deleteUser(uid) {
        try {
            if (!this.firebaseApp) {
                throw new Error('Firebase not initialized');
            }
            const auth = admin.auth(this.firebaseApp);
            await auth.deleteUser(uid);
            console.log(`User ${uid} deleted successfully`);
        }
        catch (error) {
            console.error('Delete user error:', error);
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map