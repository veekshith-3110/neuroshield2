import React, { useState } from 'react';
import { sendOTP, verifyOTP, getChannelType, formatPhoneNumber } from '../utils/otpService';
import { validatePassword, getStrengthColor, getStrengthText } from '../utils/passwordValidator';
import './ForgotPassword.css';

const ForgotPassword = ({ onClose, onSendCode }) => {
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputValue = identifier || email;
    if (!inputValue) {
      setError('Please enter your email address or phone number');
      setLoading(false);
      return;
    }

    try {
      const channel = getChannelType(inputValue);
      const formattedIdentifier = channel === 'sms' ? formatPhoneNumber(inputValue) : inputValue;
      
      const result = await sendOTP(formattedIdentifier, channel);
      
      if (result.success) {
        setVerificationId(result.verification_id);
        setEmail(formattedIdentifier);
        setMessage(`Reset code sent to ${formattedIdentifier}. Please check your ${channel === 'email' ? 'email' : 'SMS'}.`);
        setStep('verify');
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(`Password requirements not met: ${validation.errors.join(', ')}`);
      setShowPasswordRequirements(true);
      return;
    }

    if (!verificationId) {
      setError('Verification session expired. Please request a new code.');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP first
      const verifyResult = await verifyOTP(verificationId, resetCode);
      
      if (!verifyResult.success || !verifyResult.verified) {
        setError('Invalid or expired OTP code. Please try again.');
        setLoading(false);
        return;
      }

      // OTP verified, now update password
      // In production, this would call your backend API to update the password
      // For now, we'll just show success message
      // TODO: Call your backend API to update password
      // await fetch('YOUR_API_ENDPOINT/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: identifier || email, newPassword })
      // });
      
      setMessage('Password reset successful! You can now login with your new password.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid reset code or error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-overlay" onClick={onClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <button className="forgot-password-close" onClick={onClose}>×</button>
        
        <h2 className="forgot-password-title">Reset Password</h2>

        {error && (
          <div className="forgot-password-error">{error}</div>
        )}

        {message && (
          <div className="forgot-password-message">{message}</div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="forgot-password-form">
            <p className="forgot-password-text">
              Enter your email address or phone number and we'll send you a reset code.
            </p>
            
            <div className="form-item">
              <label htmlFor="reset-identifier">Email or Phone Number</label>
              <input
                type="text"
                id="reset-identifier"
                value={identifier || email}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('@')) {
                    setEmail(value);
                    setIdentifier('');
                  } else {
                    setIdentifier(value);
                    setEmail('');
                  }
                }}
                placeholder="your@email.com or +1234567890"
                required
                autoFocus
              />
              <p className="form-hint">Enter your email address or phone number</p>
            </div>

            <button type="submit" className="forgot-password-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="forgot-password-form">
            <p className="forgot-password-text">
              Enter the reset code sent to your email and your new password.
            </p>
            
            <div className="form-item">
              <label htmlFor="reset-code">Reset Code</label>
              <input
                type="text"
                id="reset-code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                autoFocus
              />
            </div>

            <div className="form-item">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPassword(value);
                  if (value.length > 0) {
                    const validation = validatePassword(value);
                    setPasswordValidation(validation);
                    setShowPasswordRequirements(true);
                  } else {
                    setPasswordValidation(null);
                    setShowPasswordRequirements(false);
                  }
                }}
                onFocus={() => newPassword && setShowPasswordRequirements(true)}
                placeholder="Enter new password"
                minLength="8"
                required
              />
              
              {showPasswordRequirements && (
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

            <div className="form-item">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                minLength="6"
                required
              />
            </div>

            <div className="forgot-password-actions">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="forgot-password-back"
              >
                Back
              </button>
              <button type="submit" className="forgot-password-submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

