import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../services/authService';
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export interface AuthenticatedRequest extends Request {
    user: AuthUser;
}
/**
 * Middleware to authenticate requests using Firebase tokens
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to optionally authenticate requests
 * If token is present, verify it, but don't fail if no token is provided
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if user has specific role
 */
export declare const requireRole: (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user has any of the specified roles
 */
export declare const requireAnyRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user can access their own resources
 */
export declare const requireOwnership: (userIdParam?: string) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to rate limit authentication attempts
 */
export declare const rateLimitAuth: (maxAttempts?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map