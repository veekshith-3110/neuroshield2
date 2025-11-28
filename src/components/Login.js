import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { sendOTP, verifyOTP, getChannelType, formatPhoneNumber } from '../utils/otpService';
import { validatePassword, getStrengthColor, getStrengthText } from '../utils/passwordValidator';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    identifier: '' // For OTP login
  });
  const [otpData, setOtpData] = useState({
    verification_id: null,
    code: '',
    step: 'request' // 'request' or 'verify'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const passwordInputRef = useRef(null);
  const eyeRef = useRef(null);
  const beamRef = useRef(null);

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize password input light effect
    const root = document.documentElement;
    const eye = eyeRef.current;
    const beam = beamRef.current;
    const passwordInput = passwordInputRef.current;

    if (!eye || !beam || !passwordInput) return;

    const handleMouseMove = (e) => {
      const rect = beam.getBoundingClientRect();
      const mouseX = rect.right + (rect.width / 2);
      const mouseY = rect.top + (rect.height / 2);
      const rad = Math.atan2(mouseX - e.pageX, mouseY - e.pageY);
      const degrees = (rad * (20 / Math.PI) * -1) - 350;
      root.style.setProperty('--beamDegrees', `${degrees}deg`);
    };

    const handleEyeClick = (e) => {
      e.preventDefault();
      document.body.classList.toggle('show-password');
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.focus();
    };

    window.addEventListener('mousemove', handleMouseMove);
    eye.addEventListener('click', handleEyeClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      eye.removeEventListener('click', handleEyeClick);
    };
  }, []);

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      const result = loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed');
      }
    } else {
      setError('Google login failed - no credential received');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For email field, it can be email or phone
    if (name === 'email' && loginMethod === 'password') {
      setFormData(prev => ({
        ...prev,
        email: value,
        phone: value.includes('@') ? '' : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleOTPRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const identifier = formData.email || formData.phone;
    if (!identifier) {
      setError('Please enter your email or phone number');
      setLoading(false);
      return;
    }

    try {
      const channel = getChannelType(identifier);
      const formattedIdentifier = channel === 'sms' ? formatPhoneNumber(identifier) : identifier;
      
      const result = await sendOTP(formattedIdentifier, channel);
      
      if (result.success) {
        setOtpData({
          verification_id: result.verification_id,
          code: '',
          step: 'verify'
        });
        setFormData(prev => ({ ...prev, identifier: formattedIdentifier }));
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otpData.code || otpData.code.length < 4) {
      setError('Please enter the OTP code');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(otpData.verification_id, otpData.code);
      
      if (result.success && result.verified) {
        // OTP verified, log the user in
        const identifier = formData.identifier;
        const isEmail = identifier.includes('@');
        const userData = {
          email: isEmail ? identifier : null,
          phone: !isEmail ? identifier : null,
          name: identifier.split('@')[0] || identifier,
          id: Date.now().toString(),
          provider: 'otp'
        };
        
        localStorage.setItem('burnoutAppUser', JSON.stringify(userData));
        navigate('/dashboard');
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loginMethod === 'otp') {
      if (otpData.step === 'request') {
        await handleOTPRequest(e);
      } else {
        await handleOTPVerify(e);
      }
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Get identifier (email or phone) - for password login, use email field which accepts both
      const identifier = loginMethod === 'otp' 
        ? (formData.email || formData.phone || formData.identifier)
        : formData.email;
      
      if (!identifier) {
        setError('Please enter your email or phone number');
        setLoading(false);
        return;
      }

      // Validate password for signup
      if (!isLogin) {
        const validation = validatePassword(formData.password);
        if (!validation.isValid) {
          setError(`Password requirements not met: ${validation.errors.join(', ')}`);
          setLoading(false);
          setShowPasswordRequirements(true);
          return;
        }
      }

      let result;
      if (isLogin) {
        result = login(identifier, formData.password);
      } else {
        result = signup(identifier, formData.password, formData.name);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Logo/Header */}
        <div className="login-header">
          <h1 className="login-title">🛡️ Neuroshield</h1>
          <p className="login-subtitle">Digital Wellness Early-Warning System</p>
        </div>

        {/* Login/Signup Card */}
        <div className="login-card">
          <div className="login-tabs">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setLoginMethod('password');
                setError('');
                setFormData({ email: '', password: '', name: '', phone: '', identifier: '' });
                setOtpData({ verification_id: null, code: '', step: 'request' });
              }}
              className={`login-tab ${isLogin ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setLoginMethod('password');
                setError('');
                setFormData({ email: '', password: '', name: '', phone: '', identifier: '' });
                setOtpData({ verification_id: null, code: '', step: 'request' });
              }}
              className={`login-tab ${!isLogin ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Google Sign-In Button - Above form */}
          <div className="google-signin-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <div className="login-divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-item">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                  />
                </div>
              </div>
            )}

            <div className="form-item">
              <label htmlFor="email">Email or Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com or +1234567890"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  required
                />
              </div>
              <p className="form-hint">Enter your email address or phone number</p>
            </div>

            <div className="form-item">
              <div className="password-label-wrapper">
                <label htmlFor="password">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  ref={passwordInputRef}
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => !isLogin && formData.password && setShowPasswordRequirements(true)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  required
                  minLength={!isLogin ? 8 : 6}
                />
                <button type="button" id="eyeball" ref={eyeRef}>
                  <div className="eye"></div>
                </button>
                <div id="beam" ref={beamRef}></div>
              </div>
              
              {/* Password Requirements for Signup */}
              {!isLogin && showPasswordRequirements && (
                <div className="password-requirements">
                  <div className="password-strength">
                    <div className="strength-label">Password Strength:</div>
                    <div className="strength-bar-container">
                      <div 
                        className={`strength-bar ${passwordValidation ? getStrengthColor(passwordValidation.strength) : 'bg-gray-300'}`}
                        style={{ 
                          width: passwordValidation 
                            ? `${(passwordValidation.strength === 'weak' ? 25 : passwordValidation.strength === 'medium' ? 50 : passwordValidation.strength === 'strong' ? 75 : 100)}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    {passwordValidation && (
                      <span className={`strength-text ${passwordValidation.strength}`}>
                        {getStrengthText(passwordValidation.strength)}
                      </span>
                    )}
                  </div>
                  
                  <div className="requirements-list">
                    <p className="requirements-title">Password must contain:</p>
                    <ul>
                      <li className={passwordValidation?.checks.length ? 'requirement-met' : 'requirement-unmet'}>
                        {passwordValidation?.checks.length ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={passwordValidation?.checks.uppercase ? 'requirement-met' : 'requirement-unmet'}>
                        {passwordValidation?.checks.uppercase ? '✓' : '○'} One uppercase letter (A-Z)
                      </li>
                      <li className={passwordValidation?.checks.lowercase ? 'requirement-met' : 'requirement-unmet'}>
                        {passwordValidation?.checks.lowercase ? '✓' : '○'} One lowercase letter (a-z)
                      </li>
                      <li className={passwordValidation?.checks.numbers ? 'requirement-met' : 'requirement-unmet'}>
                        {passwordValidation?.checks.numbers ? '✓' : '○'} One number (0-9)
                      </li>
                      <li className={passwordValidation?.checks.specialChars ? 'requirement-met' : 'requirement-unmet'}>
                        {passwordValidation?.checks.specialChars ? '✓' : '○'} One special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {isLogin && loginMethod === 'password' && (
              <div className="login-demo">
                <p>Demo: demo@burnout.com / demo123</p>
                <p>Or: +1234567890 / demo123</p>
              </div>
            )}

            <button type="submit" id="submit" disabled={loading}>
              {loading 
                ? 'Please wait...' 
                : loginMethod === 'otp' && isLogin
                  ? (otpData.step === 'request' ? 'Send OTP' : 'Verify OTP')
                  : (isLogin ? 'Sign in' : 'Sign up')
              }
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setLoginMethod('password');
                  setError('');
                  setFormData({ email: '', password: '', name: '', phone: '', identifier: '' });
                  setOtpData({ verification_id: null, code: '', step: 'request' });
                }}
                className="login-link"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        <p className="login-privacy">
          Your data is stored locally and never leaves your device
        </p>
      </div>

      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSendCode={(email) => {
            // This will be handled by the ForgotPassword component
            console.log('Sending reset code to:', email);
          }}
        />
      )}
    </div>
  );
};

export default Login;

