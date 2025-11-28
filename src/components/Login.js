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
    <div className="login-page-wrapper">
      <div className="section">
        <div className="container">
          <div className="row full-height justify-content-center">
            <div className="col-12 text-center align-self-center py-5">
              <div className="section pb-5 pt-5 pt-sm-2 text-center">
                <h6 className="mb-0 pb-3">
                  <span>Log In </span>
                  <span>Sign Up</span>
                </h6>
              
              <input
                className="checkbox"
                type="checkbox"
                id="reg-log"
                name="reg-log"
                checked={!isLogin}
                onChange={handleToggle}
              />
              <label htmlFor="reg-log"></label>

              <div className="card-3d-wrap mx-auto">
                <div className="card-3d-wrapper">
                  {/* Login Card */}
                  <div className="card-front">
                    <div className="center-wrap">
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3">Log In</h4>
                        
                        {error && (
                          <div style={{
                            backgroundColor: '#ff4444',
                            color: '#fff',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '14px'
                          }}>
                            {error}
                          </div>
                        )}

                        <form onSubmit={handleLogin}>
                          <div className="form-group">
                            <input
                              type="email"
                              name="email"
                              className="form-style"
                              placeholder="Your Email"
                              id="logemail"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              autoComplete="off"
                            />
                            <i className="input-icon uil uil-at"></i>
                          </div>

                          <div className="form-group mt-2" style={{ position: 'relative' }}>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="form-style"
                              placeholder="Your Password"
                              id="logpass"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              autoComplete="off"
                            />
                            <i className="input-icon uil uil-lock-alt"></i>
                            <span
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#ffeba7',
                                fontSize: '18px',
                                zIndex: 10,
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                outline: 'none'
                              }}
                            >
                              <i className={`uil ${showPassword ? 'uil-eye-slash' : 'uil-eye'}`}></i>
                            </span>
                          </div>

                          <button
                            type="submit"
                            className="btn mt-4"
                            disabled={loading}
                            style={{ 
                              cursor: loading ? 'not-allowed' : 'pointer',
                              width: '100%'
                            }}
                          >
                            {loading ? 'Loading...' : 'submit'}
                          </button>
                        </form>

                        <div className="mt-4" style={{ textAlign: 'center' }}>
                          <div style={{ 
                            margin: '20px 0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#c4c3ca',
                            fontSize: '14px'
                          }}>
                            <span style={{ flex: 1, height: '1px', background: '#2a2b38' }}></span>
                            <span style={{ padding: '0 15px' }}>OR</span>
                            <span style={{ flex: 1, height: '1px', background: '#2a2b38' }}></span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            marginTop: '15px'
                          }}>
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

                        <p className="mb-0 mt-4 text-center">
                          <a href="#0" className="link" onClick={(e) => {
                            e.preventDefault();
                            alert('Forgot password feature coming soon!');
                          }}>
                            Forgot your password?
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signup Card */}
                  <div className="card-back">
                    <div className="center-wrap">
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3">Sign Up</h4>
                        
                        {error && (
                          <div style={{
                            backgroundColor: '#ff4444',
                            color: '#fff',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '14px'
                          }}>
                            {error}
                          </div>
                        )}

                        <form onSubmit={handleSignup}>
                          <div className="form-group">
                            <input
                              type="text"
                              name="name"
                              className="form-style"
                              placeholder="Your Full Name"
                              id="logname"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              autoComplete="off"
                            />
                            <i className="input-icon uil uil-user"></i>
                          </div>

                          <div className="form-group mt-2">
                            <input
                              type="email"
                              name="email"
                              className="form-style"
                              placeholder="Your Email"
                              id="logemail"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              autoComplete="off"
                            />
                            <i className="input-icon uil uil-at"></i>
                          </div>

                          <div className="form-group mt-2" style={{ position: 'relative' }}>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="form-style"
                              placeholder="Your Password"
                              id="signpass"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              autoComplete="off"
                            />
                            <i className="input-icon uil uil-lock-alt"></i>
                            <span
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#ffeba7',
                                fontSize: '18px',
                                zIndex: 10,
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                outline: 'none'
                              }}
                            >
                              <i className={`uil ${showPassword ? 'uil-eye-slash' : 'uil-eye'}`}></i>
                            </span>
                          </div>

                          <button
                            type="submit"
                            className="btn mt-4"
                            disabled={loading}
                            style={{ 
                              cursor: loading ? 'not-allowed' : 'pointer',
                              width: '100%'
                            }}
                          >
                            {loading ? 'Loading...' : 'submit'}
                          </button>
                        </form>

                        <div className="mt-4" style={{ textAlign: 'center' }}>
                          <div style={{ 
                            margin: '20px 0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#c4c3ca',
                            fontSize: '14px'
                          }}>
                            <span style={{ flex: 1, height: '1px', background: '#2a2b38' }}></span>
                            <span style={{ padding: '0 15px' }}>OR</span>
                            <span style={{ flex: 1, height: '1px', background: '#2a2b38' }}></span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            marginTop: '15px'
                          }}>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
