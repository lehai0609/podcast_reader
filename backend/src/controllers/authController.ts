import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService, LoginCredentials, RegisterCredentials, PasswordResetRequest, TokenRefreshRequest } from '../services/authService';

export class AuthController {
  // User registration
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const credentials: RegisterCredentials = {
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.displayName,
      };

      const user = await authService.register(credentials);

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
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  // User login
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const credentials: LoginCredentials = {
        email: req.body.email,
        password: req.body.password,
      };

      const tokens = await authService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: tokens,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  // User logout
  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await authService.logout(uid);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }

  // Password reset request
  public static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const request: PasswordResetRequest = {
        email: req.body.email,
      };

      await authService.requestPasswordReset(request);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Password reset request failed',
      });
    }
  }

  // Token refresh
  public static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const request: TokenRefreshRequest = {
        refreshToken: req.body.refreshToken,
      };

      const tokens = await authService.refreshToken(request);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  // Get user profile
  public static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const user = await authService.getUserProfile(uid);

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
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get profile',
      });
    }
  }

  // Update user profile
  public static async updateProfile(req: Request, res: Response): Promise<void> {
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

      const user = await authService.updateUserProfile(uid, updates);

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
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }

  // Delete user account
  public static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await authService.deleteUser(uid);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete account',
      });
    }
  }

  // Verify token endpoint
  public static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'No token provided',
        });
        return;
      }

      const user = await authService.verifyToken(token);

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
    } catch (error: any) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Token verification failed',
      });
    }
  }
}
