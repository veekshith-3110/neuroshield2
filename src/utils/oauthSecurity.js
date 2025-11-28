/**
 * OAuth 2.0 Security Utilities
 * Implements OAuth 2.0 security best practices
 */

// Generate secure random state for CSRF protection
export const generateState = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Store state in sessionStorage (more secure than localStorage for OAuth)
export const storeOAuthState = (state) => {
  sessionStorage.setItem('oauth_state', state);
  // Set expiration (5 minutes)
  sessionStorage.setItem('oauth_state_expiry', Date.now() + 5 * 60 * 1000);
};

// Verify state to prevent CSRF attacks
export const verifyOAuthState = (receivedState) => {
  const storedState = sessionStorage.getItem('oauth_state');
  const expiry = sessionStorage.getItem('oauth_state_expiry');
  
  // Check if state exists
  if (!storedState) {
    console.error('OAuth state not found - possible CSRF attack');
    return false;
  }
  
  // Check if state expired
  if (expiry && Date.now() > parseInt(expiry)) {
    console.error('OAuth state expired');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_state_expiry');
    return false;
  }
  
  // Verify state matches
  if (storedState !== receivedState) {
    console.error('OAuth state mismatch - possible CSRF attack');
    return false;
  }
  
  // Clean up after verification
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_state_expiry');
  
  return true;
};

// Generate PKCE code verifier (for enhanced security)
export const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(Array.from(array, byte => String.fromCharCode(byte)).join(''));
};

// Generate PKCE code challenge from verifier
export const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(String.fromCharCode(...new Uint8Array(digest)));
};

// Base64 URL encoding (RFC 4648)
const base64URLEncode = (str) => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Store tokens securely
export const storeTokens = (accessToken, refreshToken, expiresIn) => {
  // Store access token in memory (more secure) or sessionStorage
  // For production, consider using httpOnly cookies
  const tokenData = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + (expiresIn * 1000),
    issuedAt: Date.now()
  };
  
  // Use sessionStorage for client-side (better than localStorage)
  sessionStorage.setItem('oauth_tokens', JSON.stringify(tokenData));
};

// Get stored tokens
export const getStoredTokens = () => {
  const tokenData = sessionStorage.getItem('oauth_tokens');
  if (!tokenData) return null;
  
  try {
    const tokens = JSON.parse(tokenData);
    
    // Check if token expired
    if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
      // Token expired, try to refresh
      return { expired: true, refreshToken: tokens.refreshToken };
    }
    
    return tokens;
  } catch (error) {
    console.error('Error parsing stored tokens:', error);
    return null;
  }
};

// Clear stored tokens
export const clearTokens = () => {
  sessionStorage.removeItem('oauth_tokens');
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_state_expiry');
};

// Validate JWT token structure (basic validation)
export const validateJWTStructure = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  try {
    // Decode header
    const header = JSON.parse(atob(parts[0]));
    if (!header.alg || !header.typ) {
      return false;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp || !payload.iat) {
      return false;
    }
    
    // Check expiration
    if (Date.now() >= payload.exp * 1000) {
      return false;
    }
    
    return { header, payload, valid: true };
  } catch (error) {
    console.error('JWT validation error:', error);
    return false;
  }
};

// Secure token storage with encryption (for sensitive data)
export const encryptToken = async (token, key) => {
  // In production, use proper encryption (Web Crypto API)
  // For now, we'll use sessionStorage which is more secure than localStorage
  return token; // Simplified - implement proper encryption in production
};

// Decrypt token
export const decryptToken = async (encryptedToken, key) => {
  return encryptedToken; // Simplified - implement proper decryption in production
};

// OAuth 2.0 Security Headers
export const getSecurityHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Add CSRF token if available
    // 'X-CSRF-Token': getCSRFToken(),
  };
};

// Rate limiting helper (prevent brute force)
let loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export const checkRateLimit = (identifier) => {
  const now = Date.now();
  const attempts = loginAttempts[identifier] || { count: 0, lockoutUntil: 0 };
  
  // Check if locked out
  if (attempts.lockoutUntil > now) {
    const minutesLeft = Math.ceil((attempts.lockoutUntil - now) / 60000);
    return {
      allowed: false,
      message: `Too many login attempts. Please try again in ${minutesLeft} minute(s).`
    };
  }
  
  // Reset if lockout expired
  if (attempts.lockoutUntil > 0 && attempts.lockoutUntil <= now) {
    loginAttempts[identifier] = { count: 0, lockoutUntil: 0 };
  }
  
  return { allowed: true };
};

export const recordLoginAttempt = (identifier, success) => {
  if (!loginAttempts[identifier]) {
    loginAttempts[identifier] = { count: 0, lockoutUntil: 0 };
  }
  
  if (success) {
    // Reset on success
    loginAttempts[identifier] = { count: 0, lockoutUntil: 0 };
  } else {
    // Increment on failure
    loginAttempts[identifier].count++;
    
    if (loginAttempts[identifier].count >= MAX_ATTEMPTS) {
      loginAttempts[identifier].lockoutUntil = Date.now() + LOCKOUT_TIME;
    }
  }
};

// Clear rate limit data (for testing)
export const clearRateLimit = () => {
  loginAttempts = {};
};

