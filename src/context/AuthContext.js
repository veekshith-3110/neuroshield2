import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('burnoutAppUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('burnoutAppUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (identifier, password) => {
    // Simple authentication - in production, this would call an API
    // identifier can be email or phone number
    const isEmail = identifier.includes('@');
    const isPhone = /^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''));
    
    const demoUsers = [
      { email: 'demo@burnout.com', password: 'demo123', name: 'Demo User', provider: 'email' },
      { email: 'user@example.com', password: 'password', name: 'Test User', provider: 'email' },
      { phone: '+1234567890', password: 'demo123', name: 'Demo Phone User', provider: 'phone' }
    ];

    const foundUser = demoUsers.find(u => 
      (u.email === identifier || u.phone === identifier) && u.password === password
    );
    
    if (foundUser || (identifier && password)) {
      const userData = foundUser || {
        email: isEmail ? identifier : null,
        phone: isPhone ? identifier : null,
        name: isEmail ? identifier.split('@')[0] : identifier,
        id: Date.now().toString(),
        provider: isEmail ? 'email' : 'phone'
      };
      
      localStorage.setItem('burnoutAppUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email/phone or password' };
  };

  const signup = (identifier, password, name) => {
    // identifier can be email or phone number
    if (identifier && password) {
      const isEmail = identifier.includes('@');
      const isPhone = /^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''));
      
      const userData = {
        email: isEmail ? identifier : null,
        phone: isPhone ? identifier : null,
        name: name || (isEmail ? identifier.split('@')[0] : identifier),
        id: Date.now().toString(),
        provider: isEmail ? 'email' : 'phone'
      };
      
      localStorage.setItem('burnoutAppUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    
    return { success: false, error: 'Please fill in all fields' };
  };

  const loginWithGoogle = (credential) => {
    try {
      // Decode JWT token (simplified - in production, verify on backend)
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const userData = {
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        picture: payload.picture,
        id: payload.sub,
        provider: 'google'
      };
      
      localStorage.setItem('burnoutAppUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Error processing Google login:', error);
      return { success: false, error: 'Failed to process Google login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('burnoutAppUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        logout,
        loading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

