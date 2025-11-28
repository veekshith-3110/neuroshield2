/**
 * OAuth 2.0 Security Middleware for Backend
 * Implements server-side OAuth 2.0 security policies
 */

// Note: jsonwebtoken needs to be installed: npm install jsonwebtoken
// For now, using crypto for token generation (JWT can be added later)
import crypto from 'crypto';

// OAuth 2.0 Security Configuration
const OAUTH_CONFIG = {
  // Token expiration times
  ACCESS_TOKEN_EXPIRY: 3600, // 1 hour
  REFRESH_TOKEN_EXPIRY: 86400 * 30, // 30 days
  
  // JWT secret (should be in environment variable)
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Allowed origins (CORS)
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
};

// In-memory token store (use Redis in production)
const tokenStore = new Map();
const loginAttempts = new Map();

/**
 * Generate secure random token
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate OAuth 2.0 access token (JWT)
 * Note: For full JWT support, install jsonwebtoken: npm install jsonwebtoken
 */
export const generateAccessToken = (user) => {
  const payload = {
    sub: user.id || user.email,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + OAUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
    jti: generateSecureToken(16), // JWT ID for revocation
  };
  
  // Simple token generation (for production, use jsonwebtoken)
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // For production, add signature using JWT library
  return `${encodedHeader}.${encodedPayload}.signature`;
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId) => {
  const token = generateSecureToken(64);
  const expiresAt = Date.now() + (OAUTH_CONFIG.REFRESH_TOKEN_EXPIRY * 1000);
  
  // Store refresh token
  tokenStore.set(token, {
    userId,
    expiresAt,
    createdAt: Date.now(),
  });
  
  return token;
};

/**
 * Verify and decode access token
 * Note: For full JWT verification, install jsonwebtoken
 */
export const verifyAccessToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    // Check expiration
    if (Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }
    
    // Check if token is revoked
    if (tokenStore.has(`revoked:${payload.jti}`)) {
      throw new Error('Token has been revoked');
    }
    
    // For production, verify signature using JWT library
    return payload;
  } catch (error) {
    if (error.message.includes('expired')) {
      throw new Error('Token expired');
    }
    if (error.message.includes('Invalid')) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  const tokenData = tokenStore.get(token);
  
  if (!tokenData) {
    throw new Error('Invalid refresh token');
  }
  
  if (Date.now() > tokenData.expiresAt) {
    tokenStore.delete(token);
    throw new Error('Refresh token expired');
  }
  
  return tokenData;
};

/**
 * Revoke token
 */
export const revokeToken = (token) => {
  try {
    const decoded = verifyAccessToken(token);
    tokenStore.set(`revoked:${decoded.jti}`, true);
    return true;
  } catch (error) {
    // If token is invalid, consider it already revoked
    return false;
  }
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = (token) => {
  tokenStore.delete(token);
};

/**
 * OAuth 2.0 Authentication Middleware
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: error.message || 'Invalid or expired token' });
  }
};

/**
 * Rate limiting for login attempts
 */
export const checkRateLimit = (identifier) => {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockoutUntil: 0 };
  const now = Date.now();
  
  // Check if locked out
  if (attempts.lockoutUntil > now) {
    const minutesLeft = Math.ceil((attempts.lockoutUntil - now) / 60000);
    return {
      allowed: false,
      message: `Too many login attempts. Please try again in ${minutesLeft} minute(s).`,
    };
  }
  
  // Reset if lockout expired
  if (attempts.lockoutUntil > 0 && attempts.lockoutUntil <= now) {
    loginAttempts.set(identifier, { count: 0, lockoutUntil: 0 });
  }
  
  return { allowed: true };
};

/**
 * Record login attempt
 */
export const recordLoginAttempt = (identifier, success) => {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockoutUntil: 0 };
  
  if (success) {
    // Reset on success
    loginAttempts.set(identifier, { count: 0, lockoutUntil: 0 });
  } else {
    // Increment on failure
    attempts.count++;
    
    if (attempts.count >= OAUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
      attempts.lockoutUntil = Date.now() + OAUTH_CONFIG.LOCKOUT_TIME;
    }
    
    loginAttempts.set(identifier, attempts);
  }
};

/**
 * CORS security headers
 */
export const securityHeaders = (req, res, next) => {
  // Don't set CORS headers here - CORS middleware handles that
  // Only set security headers that don't interfere with CORS
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Note: Strict-Transport-Security should only be set for HTTPS
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Don't handle OPTIONS here - let CORS middleware handle it
  next();
};

/**
 * Clean up expired tokens (run periodically)
 */
export const cleanupExpiredTokens = () => {
  const now = Date.now();
  
  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt && now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
  
  // Clean up old login attempts
  for (const [identifier, attempts] of loginAttempts.entries()) {
    if (attempts.lockoutUntil > 0 && now > attempts.lockoutUntil) {
      loginAttempts.delete(identifier);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeToken,
  revokeRefreshToken,
  authenticateToken,
  checkRateLimit,
  recordLoginAttempt,
  securityHeaders,
};

