import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  checkRateLimit,
  recordLoginAttempt
} from '../utils/oauthSecurity';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('burnoutAppUser');
    const storedGuest = localStorage.getItem('burnoutAppGuest');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsGuest(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('burnoutAppUser');
      }
    } else if (storedGuest === 'true') {
      // Create guest user
      const guestUser = {
        id: 'guest_' + Date.now(),
        email: 'guest@neuroshield.app',
        name: 'Guest User',
        isGuest: true
      };
      setUser(guestUser);
      setIsGuest(true);
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    // OAuth 2.0 Security: Rate limiting
    const rateLimitCheck = checkRateLimit(identifier);
    if (!rateLimitCheck.allowed) {
      return { success: false, error: rateLimitCheck.message };
    }

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      console.log('🔐 Attempting login to:', `${BACKEND_URL}/api/auth/login`);
      console.log('📤 Sending:', { identifier, password: '***' });
      
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          const text = await response.text();
          console.error('❌ Failed to parse JSON response:', text);
          return { success: false, error: `Server returned invalid JSON. Status: ${response.status}. Response: ${text.substring(0, 200)}` };
        }
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response from login:', text);
        return { success: false, error: `Server error: ${response.status} ${response.statusText}. ${text.substring(0, 200)}` };
      }
      
      console.log('📥 Response data:', data);

      if (response.ok && data.success) {
        // Clear guest status if logging in with real account
        localStorage.removeItem('burnoutAppGuest');
        setIsGuest(false);
        
        // Store token and user data
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        localStorage.setItem('burnoutAppUser', JSON.stringify(data.user));
        setUser(data.user);
        
        // OAuth 2.0 Security: Record successful login
        recordLoginAttempt(identifier, true);
        
        return { success: true };
      } else {
        // OAuth 2.0 Security: Record failed login attempt
        recordLoginAttempt(identifier, false);
        
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      recordLoginAttempt(identifier, false);
      return { success: false, error: `Network error: ${error.message}. Please check if the backend server is running on port 5000.` };
    }
  };

  const signup = async (identifier, password, name) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      console.log('🔐 Attempting signup to:', `${BACKEND_URL}/api/auth/signup`);
      console.log('📤 Sending:', { identifier, password: '***', name });
      
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, name }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          const text = await response.text();
          console.error('❌ Failed to parse JSON response:', text);
          return { success: false, error: `Server returned invalid JSON. Status: ${response.status}. Response: ${text.substring(0, 200)}` };
        }
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response from signup:', text);
        return { success: false, error: `Server error: ${response.status} ${response.statusText}. ${text.substring(0, 200)}` };
      }
      
      console.log('📥 Response data:', data);

      console.log('📊 Response analysis:', {
        ok: response.ok,
        status: response.status,
        hasSuccess: !!data.success,
        hasError: !!data.error,
        hasUser: !!data.user,
        hasToken: !!data.token
      });

      if (response.ok && data.success) {
        // Clear guest status if signing up with real account
        localStorage.removeItem('burnoutAppGuest');
        setIsGuest(false);
        
        // Store token and user data
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          console.log('✅ Token stored');
        }
        
        if (data.user) {
          localStorage.setItem('burnoutAppUser', JSON.stringify(data.user));
          setUser(data.user);
          console.log('✅ User data stored:', data.user);
        }
        
        return { success: true };
      } else {
        const errorMessage = data.error || data.message || `Signup failed (Status: ${response.status})`;
        console.error('❌ Signup failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return { success: false, error: `Network error: ${error.message}. Please check if the backend server is running on port 5000.` };
    }
  };


  const loginWithGoogle = async (credential) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear guest status if logging in with Google
        localStorage.removeItem('burnoutAppGuest');
        setIsGuest(false);
        
        // Store token and user data
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        localStorage.setItem('burnoutAppUser', JSON.stringify(data.user));
        setUser(data.user);
        
        // OAuth 2.0 Security: Record successful login
        if (data.user.email) {
          recordLoginAttempt(data.user.email, true);
        }
        
        return { success: true };
      } else {
        if (data.user?.email) {
          recordLoginAttempt(data.user.email, false);
        }
        return { success: false, error: data.error || 'Google login failed' };
      }
    } catch (error) {
      console.error('Error processing Google login:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      email: 'guest@neuroshield.app',
      name: 'Guest User',
      isGuest: true
    };
    localStorage.setItem('burnoutAppUser', JSON.stringify(guestUser));
    localStorage.setItem('burnoutAppGuest', 'true');
    setUser(guestUser);
    setIsGuest(true);
    // Guest mode works completely offline - no backend needed
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('burnoutAppUser');
    localStorage.removeItem('burnoutAppGuest');
    localStorage.removeItem('authToken');
    setUser(null);
    setIsGuest(false);
  };

  const updateUser = (updatedUserData) => {
    const currentUser = JSON.parse(localStorage.getItem('burnoutAppUser') || '{}');
    const updatedUser = {
      ...currentUser,
      ...updatedUserData
    };
    localStorage.setItem('burnoutAppUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user,
        isGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

