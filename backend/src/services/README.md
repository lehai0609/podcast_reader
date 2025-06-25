# Authentication Service

A centralized authentication service that provides secure user authentication using Firebase Admin SDK with optional Auth0 integration.

## Features

- **User Registration & Login**: Secure email/password authentication
- **Token Management**: JWT-based access and refresh tokens
- **Password Reset**: Secure password reset with email verification
- **Profile Management**: User profile CRUD operations
- **Role-Based Access Control**: Flexible role and permission system
- **Rate Limiting**: Protection against brute force attacks
- **Firebase Integration**: Leverages Firebase Admin SDK for security
- **Auth0 Ready**: Optional Auth0 integration for enterprise features

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Auth0 Configuration (Optional)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Application URLs
FRONTEND_URL=http://localhost:3000
PASSWORD_RESET_URL=http://localhost:3000/reset-password
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "displayName": "John Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Profile Management

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "Updated Name",
  "photoURL": "https://example.com/photo.jpg"
}
```

#### Delete User Account
```http
DELETE /api/auth/account
Authorization: Bearer <access_token>
```

### Verification

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <access_token>
```

#### Health Check
```http
GET /api/auth/health
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Middleware

### `authenticateToken`
Requires valid authentication token in Authorization header.

```typescript
import { authenticateToken } from '../middleware/authMiddleware';

router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains authenticated user data
});
```

### `optionalAuth`
Optionally authenticates the request (doesn't fail if no token).

```typescript
import { optionalAuth } from '../middleware/authMiddleware';

router.get('/public', optionalAuth, (req, res) => {
  // req.user exists if token was provided and valid
});
```

### `requireRole`
Requires specific user role.

```typescript
import { requireRole } from '../middleware/authMiddleware';

router.get('/admin', authenticateToken, requireRole('admin'), (req, res) => {
  // Only admin users can access
});
```

### `rateLimitAuth`
Rate limits authentication attempts.

```typescript
import { rateLimitAuth } from '../middleware/authMiddleware';

router.post('/login', rateLimitAuth(5, 15 * 60 * 1000), (req, res) => {
  // Max 5 attempts per 15 minutes
});
```

## Security Features

1. **Password Validation**: Strong password requirements
2. **Rate Limiting**: Prevents brute force attacks
3. **Token Expiration**: Access tokens expire after 1 hour
4. **Refresh Tokens**: Long-lived tokens for seamless re-authentication
5. **CORS Protection**: Configurable CORS settings
6. **Input Validation**: Comprehensive request validation
7. **Error Handling**: Secure error messages without sensitive data
8. **Role-Based Access**: Flexible permission system

## Usage Examples

### Frontend Integration (React Native)

```typescript
import { API_BASE_URL } from '../config';

class AuthService {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store tokens
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
    }
    
    return data;
  }

  async getProfile() {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  }
}
```

## Testing

The service includes comprehensive validation and error handling. Test with various scenarios:

1. **Valid Registration**: Proper email and strong password
2. **Invalid Registration**: Weak password, invalid email
3. **Login Attempts**: Valid/invalid credentials
4. **Token Refresh**: Valid/expired refresh tokens
5. **Rate Limiting**: Multiple failed attempts
6. **Protected Routes**: With/without valid tokens

## Deployment Notes

1. **Environment Variables**: Ensure all required env vars are set
2. **Firebase Setup**: Configure Firebase project and service account
3. **CORS Configuration**: Update FRONTEND_URL for production
4. **Rate Limiting**: Consider Redis for distributed rate limiting
5. **Logging**: Configure appropriate log levels for production
6. **Monitoring**: Set up error tracking and performance monitoring

## Next Steps

1. **Email Service**: Integrate SendGrid/AWS SES for password reset emails
2. **Social Auth**: Add Google/Facebook login support
3. **2FA**: Implement two-factor authentication
4. **Session Management**: Add session-based authentication option
5. **Audit Logging**: Track authentication events for security
