import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(formData.email, formData.password, formData.name);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
    setShowPassword(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    
    try {
      const result = await loginWithGoogle(credentialResponse.credential);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login was cancelled or failed.');
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail"></ion-icon>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <label>Email</label>
            </div>

            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <label>Password</label>
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <ion-icon name={showPassword ? "eye-off" : "eye"}></ion-icon>
              </span>
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button 
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  alert('Forgot password feature coming soon!');
                }}
              >Forgot Password?</button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>

            <div className="register-link">
              <p>Don't have an account? <button 
                type="button"
                className="register-link-button"
                onClick={handleToggle}
              >Register</button></p>
            </div>

            <div className="google-login-container">
              <div className="divider">
                <span></span>
                <span>OR</span>
                <span></span>
              </div>
              <div className="google-button-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <h2>Sign Up</h2>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-box">
              <span className="icon">
                <ion-icon name="person"></ion-icon>
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <label>Full Name</label>
            </div>

            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail"></ion-icon>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <label>Email</label>
            </div>

            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <label>Password</label>
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <ion-icon name={showPassword ? "eye-off" : "eye"}></ion-icon>
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up'}
            </button>

            <div className="register-link">
              <p>Already have an account? <button 
                type="button"
                className="register-link-button"
                onClick={handleToggle}
              >Login</button></p>
            </div>

            <div className="google-login-container">
              <div className="divider">
                <span></span>
                <span>OR</span>
                <span></span>
              </div>
              <div className="google-button-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_black"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
