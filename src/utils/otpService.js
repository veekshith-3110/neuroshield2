/**
 * OTP.dev API Service
 * Documentation: https://otp.dev/docs/
 */

import { validatePhoneNumber } from './phoneValidator';

const OTP_API_BASE = 'https://api.otp.dev/v1';
// You'll need to get your API key from https://otp.dev
const OTP_API_KEY = process.env.REACT_APP_OTP_API_KEY || '';

/**
 * Send OTP to email or phone number
 * @param {string} identifier - Email address or phone number (E.164 format: +1234567890)
 * @param {string} channel - 'email' or 'sms'
 * @returns {Promise<Object>} Response with verification_id
 */
export const sendOTP = async (identifier, channel = 'email') => {
  if (!OTP_API_KEY) {
    throw new Error('OTP API key not configured. Please set REACT_APP_OTP_API_KEY in .env file');
  }

  // Determine channel based on identifier if not specified
  if (!channel) {
    channel = identifier.includes('@') ? 'email' : 'sms';
  }

  // Validate phone number before sending SMS
  if (channel === 'sms') {
    try {
      const phoneValidation = await validatePhoneNumber(identifier);
      
      if (!phoneValidation.valid) {
        throw new Error(`Invalid phone number: ${phoneValidation.message}`);
      }

      if (!phoneValidation.canSendSMS) {
        throw new Error(`This phone number (${phoneValidation.lineType}) may not be able to receive SMS messages. Please use a mobile number.`);
      }

      // Use validated and formatted phone number
      identifier = phoneValidation.formatted;
      
      console.log('Phone validated:', {
        country: phoneValidation.countryName,
        carrier: phoneValidation.carrier,
        type: phoneValidation.lineType,
        location: phoneValidation.location
      });
    } catch (error) {
      // If validation fails but we have a fallback, continue
      if (error.message.includes('Invalid phone number')) {
        throw error;
      }
      console.warn('Phone validation warning:', error.message);
    }
  }

  try {
    const response = await fetch(`${OTP_API_BASE}/verifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OTP_API_KEY}`,
      },
      body: JSON.stringify({
        identifier: identifier,
        channel: channel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send OTP: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      verification_id: data.verification_id || data.id,
      expires_in: data.expires_in || 300, // Default 5 minutes
      phoneInfo: channel === 'sms' ? await validatePhoneNumber(identifier).catch(() => null) : null
    };
  } catch (error) {
    console.error('OTP Send Error:', error);
    throw error;
  }
};

/**
 * Verify OTP code
 * @param {string} verification_id - ID returned from sendOTP
 * @param {string} code - OTP code entered by user
 * @returns {Promise<Object>} Verification result
 */
export const verifyOTP = async (verification_id, code) => {
  if (!OTP_API_KEY) {
    throw new Error('OTP API key not configured');
  }

  try {
    const response = await fetch(`${OTP_API_BASE}/verifications/${verification_id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OTP_API_KEY}`,
      },
      body: JSON.stringify({
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `OTP verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.verified || data.status === 'verified',
      verified: data.verified || false,
    };
  } catch (error) {
    console.error('OTP Verify Error:', error);
    throw error;
  }
};

/**
 * Check if identifier is email or phone
 * @param {string} identifier - Email or phone number
 * @returns {string} 'email' or 'sms'
 */
export const getChannelType = (identifier) => {
  if (!identifier) return 'email';
  // Check if it's an email
  if (identifier.includes('@') && identifier.includes('.')) {
    return 'email';
  }
  // Check if it's a phone number (contains digits and possibly +)
  if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/[\s\-\(\)]/g, ''))) {
    return 'sms';
  }
  // Default to email
  return 'email';
};

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number in any format
 * @returns {string} E.164 formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add country code (default to +1 for US)
  if (!cleaned.startsWith('+')) {
    // If it starts with 1, add +
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = '+' + cleaned;
    } else {
      // Default to US country code
      cleaned = '+1' + cleaned;
    }
  }
  
  return cleaned;
};

