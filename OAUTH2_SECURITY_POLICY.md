# OAuth 2.0 Security Policy 2.0

## Overview

This document outlines the OAuth 2.0 security policies implemented in the Neuroshield application, following industry best practices and security standards.

## Security Features Implemented

### 1. Token Management

#### Access Tokens
- **Format**: JWT (JSON Web Tokens)
- **Expiration**: 1 hour (3600 seconds)
- **Storage**: SessionStorage (more secure than localStorage)
- **Validation**: Structure validation, expiration checking, signature verification

#### Refresh Tokens
- **Format**: Secure random tokens (64 bytes)
- **Expiration**: 30 days
- **Storage**: Server-side token store
- **Revocation**: Support for token revocation

### 2. CSRF Protection

#### State Parameter
- **Purpose**: Prevents Cross-Site Request Forgery attacks
- **Generation**: Cryptographically secure random 32-byte state
- **Storage**: SessionStorage with 5-minute expiration
- **Verification**: State is verified on callback to ensure request authenticity

#### Implementation
```javascript
// Generate state
const state = generateState();
storeOAuthState(state);

// Verify state on callback
if (!verifyOAuthState(receivedState)) {
  // Reject request - possible CSRF attack
}
```

### 3. Rate Limiting

#### Login Attempt Protection
- **Max Attempts**: 5 failed attempts
- **Lockout Duration**: 15 minutes
- **Tracking**: Per-identifier (email/phone)
- **Reset**: Automatic reset on successful login

#### Implementation
```javascript
// Check rate limit before login
const rateLimit = checkRateLimit(identifier);
if (!rateLimit.allowed) {
  return { error: rateLimit.message };
}

// Record attempt
recordLoginAttempt(identifier, success);
```

### 4. JWT Token Security

#### Token Structure Validation
- **Header Validation**: Algorithm and type verification
- **Payload Validation**: Expiration and issued-at checks
- **Signature Verification**: Backend signature validation

#### Token Expiration
- **Access Tokens**: 1 hour validity
- **Automatic Refresh**: Refresh token mechanism
- **Expired Token Handling**: Graceful error handling

### 5. Secure Storage

#### Client-Side Storage
- **SessionStorage**: Used instead of localStorage for tokens
- **Automatic Cleanup**: Tokens cleared on logout
- **No Sensitive Data**: Passwords never stored client-side

#### Server-Side Storage
- **Token Store**: In-memory Map (use Redis in production)
- **Automatic Cleanup**: Expired tokens removed periodically
- **Revocation Support**: Tokens can be revoked

### 6. CORS Security

#### Allowed Origins
- **Development**: `http://localhost:3000`
- **Production**: Configured via environment variables
- **Validation**: Origin checked on every request

#### Security Headers
```javascript
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'DENY'
'X-XSS-Protection': '1; mode=block'
'Strict-Transport-Security': 'max-age=31536000'
```

### 7. Authentication Flow

#### OAuth 2.0 Authorization Code Flow
1. **User initiates login** → Generate state parameter
2. **Redirect to OAuth provider** → Include state in request
3. **User authenticates** → Provider validates credentials
4. **Callback with code** → Verify state parameter
5. **Exchange code for tokens** → Receive access and refresh tokens
6. **Store tokens securely** → SessionStorage (client) / Token store (server)
7. **Use access token** → Include in API requests

### 8. Token Refresh

#### Refresh Token Flow
1. **Access token expires** → Client detects expiration
2. **Request refresh** → Send refresh token to backend
3. **Backend validates** → Verify refresh token
4. **Issue new tokens** → New access and refresh tokens
5. **Update storage** → Store new tokens securely

## Security Best Practices

### ✅ Implemented

1. **HTTPS Only** (Production)
   - All OAuth flows use HTTPS
   - HTTP only for local development

2. **Token Expiration**
   - Short-lived access tokens (1 hour)
   - Longer-lived refresh tokens (30 days)

3. **Secure Token Storage**
   - SessionStorage for client-side
   - Server-side token store with expiration

4. **CSRF Protection**
   - State parameter validation
   - Origin verification

5. **Rate Limiting**
   - Login attempt limiting
   - Automatic lockout after failed attempts

6. **Token Validation**
   - JWT structure validation
   - Expiration checking
   - Signature verification (backend)

7. **Secure Headers**
   - Content-Type-Options
   - Frame-Options
   - XSS Protection
   - HSTS

### 🔄 Recommended for Production

1. **PKCE (Proof Key for Code Exchange)**
   - Enhanced security for public clients
   - Code verifier/challenge mechanism

2. **Token Revocation**
   - Backend token revocation endpoint
   - Client-side token cleanup

3. **Redis Token Store**
   - Replace in-memory store
   - Distributed token management

4. **Token Encryption**
   - Encrypt sensitive token data
   - Use Web Crypto API

5. **Audit Logging**
   - Log all authentication attempts
   - Track token usage

6. **Multi-Factor Authentication**
   - Optional 2FA for sensitive operations
   - SMS/Email verification

## Configuration

### Environment Variables

```env
# OAuth 2.0 Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
JWT_SECRET=your-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Token Expiration (seconds)
ACCESS_TOKEN_EXPIRY=3600
REFRESH_TOKEN_EXPIRY=2592000

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000
```

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/revoke
GET  /api/auth/verify
```

### Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Token Lifecycle

1. **Issuance**: Token generated with expiration
2. **Usage**: Token included in Authorization header
3. **Validation**: Token verified on each request
4. **Refresh**: New token issued before expiration
5. **Revocation**: Token invalidated on logout/security event
6. **Cleanup**: Expired tokens removed automatically

## Security Checklist

- [x] CSRF protection (state parameter)
- [x] Rate limiting (login attempts)
- [x] Token expiration
- [x] Secure token storage
- [x] JWT validation
- [x] CORS configuration
- [x] Security headers
- [x] Token refresh mechanism
- [x] Token revocation support
- [ ] PKCE implementation (recommended)
- [ ] Token encryption (recommended)
- [ ] Audit logging (recommended)
- [ ] MFA support (recommended)

## Compliance

This implementation follows:
- **OAuth 2.0 RFC 6749**: Authorization Framework
- **JWT RFC 7519**: JSON Web Token
- **PKCE RFC 7636**: Proof Key for Code Exchange (recommended)
- **OWASP Top 10**: Security best practices
- **CWE-352**: CSRF prevention
- **CWE-613**: Insufficient session expiration

## Incident Response

### Token Compromise
1. Immediately revoke all tokens for affected user
2. Force re-authentication
3. Log security event
4. Notify user

### Rate Limit Triggered
1. Lock account for 15 minutes
2. Log security event
3. Send notification to user
4. Monitor for suspicious activity

## Updates

**Version 2.0** (Current)
- Added OAuth 2.0 security utilities
- Implemented CSRF protection
- Added rate limiting
- Enhanced token validation
- Security headers implementation

**Version 1.0** (Previous)
- Basic Google OAuth integration
- Simple token storage
- No security policies

## Support

For security issues or questions:
- Review this document
- Check implementation in `src/utils/oauthSecurity.js`
- Review backend security in `backend/oauthSecurity.js`
- Consult OAuth 2.0 specification: https://oauth.net/2/

