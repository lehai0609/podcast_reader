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
export declare class AuthService {
    private auth0Management;
    private firebaseApp;
    constructor();
    private initializeAuth0;
    private initializeFirebase;
    static validateLogin: import("express-validator").ValidationChain[];
    static validateRegister: import("express-validator").ValidationChain[];
    static validatePasswordReset: import("express-validator").ValidationChain[];
    static validateTokenRefresh: import("express-validator").ValidationChain[];
    register(credentials: RegisterCredentials): Promise<AuthUser>;
    login(credentials: LoginCredentials): Promise<AuthTokens>;
    logout(uid: string): Promise<void>;
    requestPasswordReset(request: PasswordResetRequest): Promise<void>;
    refreshToken(request: TokenRefreshRequest): Promise<AuthTokens>;
    verifyToken(token: string): Promise<AuthUser>;
    getUserProfile(uid: string): Promise<AuthUser>;
    updateUserProfile(uid: string, updates: Partial<AuthUser>): Promise<AuthUser>;
    deleteUser(uid: string): Promise<void>;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map