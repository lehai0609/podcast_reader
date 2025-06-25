import * as admin from 'firebase-admin';
import { ManagementClient } from 'auth0';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  customClaims?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export class AuthService {
  private auth0Management: ManagementClient | null = null;
  private firebaseApp: admin.app.App | null = null;

  constructor() {
    this.initializeAuth0();
    this.initializeFirebase();
  }

  private initializeAuth0(): void {
    try {
      const auth0Domain = process.env.AUTH0_DOMAIN;
      const auth0ClientId = process.env.AUTH0_CLIENT_ID;
      const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;

      if (auth0Domain && auth0ClientId && auth0ClientSecret) {
        this.auth0Management = new ManagementClient({
          domain: auth0Domain,
          clientId: auth0ClientId,
          clientSecret: auth0ClientSecret,
        });
        console.log('Auth0 initialized successfully');
      } else {
        console.warn('Auth0 credentials not found in environment variables');
      }
    } catch (error) {
      console.error('Failed to initialize Auth0:', error);
    }
  }

  private initializeFirebase(): void {
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
      } else {
        console.warn('Firebase credentials not found in environment variables');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  // Validation middleware
  public static validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ];

  public static validateRegister = [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('displayName').optional().isLength({ min: 2, max: 50 }),
  ];

  public static validatePasswordReset = [
    body('email').isEmail().normalizeEmail(),
  ];

  public static validateTokenRefresh = [
    body('refreshToken').notEmpty(),
  ];

  // User registration
  public async register(credentials: RegisterCredentials): Promise<AuthUser> {
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
        email: userRecord.email!,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // User login with custom token
  public async login(credentials: LoginCredentials): Promise<AuthTokens> {
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
      const refreshToken = jwt.sign(
        { uid: userRecord.uid, type: 'refresh' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return {
        accessToken: customToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
        tokenType: 'Bearer',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Logout (invalidate tokens)
  public async logout(uid: string): Promise<void> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      const auth = admin.auth(this.firebaseApp);
      
      // Revoke all refresh tokens for the user
      await auth.revokeRefreshTokens(uid);
      
      console.log(`User ${uid} logged out successfully`);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // Password reset
  public async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
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
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // Token refresh
  public async refreshToken(request: TokenRefreshRequest): Promise<AuthTokens> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      // Verify refresh token
      const decoded = jwt.verify(
        request.refreshToken,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const auth = admin.auth(this.firebaseApp);
      
      // Get user to ensure they still exist
      const userRecord = await auth.getUser(decoded.uid);
      
      // Create new custom token
      const customToken = await auth.createCustomToken(userRecord.uid);
      
      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { uid: userRecord.uid, type: 'refresh' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return {
        accessToken: customToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
        tokenType: 'Bearer',
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Verify token
  public async verifyToken(token: string): Promise<AuthUser> {
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
        email: userRecord.email!,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        customClaims: decodedToken,
      };
    } catch (error: any) {
      console.error('Token verification error:', error);
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // Get user profile
  public async getUserProfile(uid: string): Promise<AuthUser> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      const auth = admin.auth(this.firebaseApp);
      const userRecord = await auth.getUser(uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        customClaims: userRecord.customClaims,
      };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  public async updateUserProfile(uid: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      const auth = admin.auth(this.firebaseApp);
      
      const updateData: any = {};
      if (updates.email) updateData.email = updates.email;
      if (updates.displayName) updateData.displayName = updates.displayName;
      if (updates.photoURL) updateData.photoURL = updates.photoURL;
      
      const userRecord = await auth.updateUser(uid, updateData);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        customClaims: userRecord.customClaims,
      };
    } catch (error: any) {
      console.error('Update user profile error:', error);
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Delete user account
  public async deleteUser(uid: string): Promise<void> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      const auth = admin.auth(this.firebaseApp);
      await auth.deleteUser(uid);
      
      console.log(`User ${uid} deleted successfully`);
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export const authService = new AuthService();
