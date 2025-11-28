/**
 * Phone Number Validation Service
 * Uses numverify API or similar for phone validation
 * API: https://numverify.com/documentation
 */

const PHONE_VALIDATION_API = process.env.REACT_APP_PHONE_VALIDATION_API || 'https://api.numverify.com/v1/validate';
const PHONE_VALIDATION_API_KEY = process.env.REACT_APP_PHONE_VALIDATION_API_KEY || '';

/**
 * Validate phone number using numverify API
 * @param {string} phoneNumber - Phone number to validate (E.164 format preferred)
 * @returns {Promise<Object>} Validation result with phone details
 */
export const validatePhoneNumber = async (phoneNumber) => {
  // If no API key, skip validation (for development)
  if (!PHONE_VALIDATION_API_KEY) {
    console.warn('Phone validation API key not configured. Skipping validation.');
    return {
      valid: true,
      formatted: phoneNumber,
      canSendSMS: true,
      message: 'Validation skipped (no API key)'
    };
  }

  try {
    // Remove + from phone number for API call
    const phoneForAPI = phoneNumber.replace(/^\+/, '');
    
    const response = await fetch(
      `${PHONE_VALIDATION_API}?access_key=${PHONE_VALIDATION_API_KEY}&number=${phoneForAPI}&country_code=&format=1`
    );

    if (!response.ok) {
      throw new Error(`Validation API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle API errors
    if (data.error) {
      throw new Error(data.error.info || 'Phone validation failed');
    }

    return {
      valid: data.valid || false,
      formatted: data.intl_format || data.local_format || phoneNumber,
      countryCode: data.country_code,
      countryName: data.country_name,
      carrier: data.carrier,
      lineType: data.line_type,
      location: data.location,
      canSendSMS: data.valid && (data.line_type === 'mobile' || data.line_type === 'landline'),
      message: data.valid 
        ? `Valid ${data.line_type} number in ${data.country_name}`
        : 'Invalid phone number'
    };
  } catch (error) {
    console.error('Phone validation error:', error);
    // Return a fallback response
    return {
      valid: true, // Assume valid if validation fails (don't block user)
      formatted: phoneNumber,
      canSendSMS: true,
      message: 'Validation unavailable, proceeding anyway',
      error: error.message
    };
  }
};

/**
 * Check if phone number can receive SMS
 * @param {string} phoneNumber - Phone number to check
 * @returns {Promise<boolean>} True if can receive SMS
 */
export const canReceiveSMS = async (phoneNumber) => {
  const validation = await validatePhoneNumber(phoneNumber);
  return validation.canSendSMS || false;
};

/**
 * Format phone number based on validation result
 * @param {string} phoneNumber - Phone number to format
 * @returns {Promise<string>} Formatted phone number (E.164)
 */
export const formatValidatedPhone = async (phoneNumber) => {
  const validation = await validatePhoneNumber(phoneNumber);
  return validation.formatted || phoneNumber;
};

