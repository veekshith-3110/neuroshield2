/**
 * Test Phone Validation API
 * Use this to test if your phone validation API is working
 */

import { validatePhoneNumber } from './phoneValidator';

/**
 * Test phone number validation
 * @param {string} phoneNumber - Phone number to test
 * @returns {Promise<void>}
 */
export const testPhoneValidation = async (phoneNumber) => {
  console.log('Testing phone validation for:', phoneNumber);
  
  try {
    const result = await validatePhoneNumber(phoneNumber);
    
    console.log('Validation Result:', {
      valid: result.valid,
      formatted: result.formatted,
      country: result.countryName,
      carrier: result.carrier,
      lineType: result.lineType,
      location: result.location,
      canSendSMS: result.canSendSMS,
      message: result.message
    });

    if (result.valid && result.canSendSMS) {
      console.log('✅ Phone number is valid and can receive SMS');
      return {
        success: true,
        message: `Valid ${result.lineType} number. Can send SMS.`,
        data: result
      };
    } else if (result.valid && !result.canSendSMS) {
      console.log('⚠️ Phone number is valid but may not receive SMS');
      return {
        success: false,
        message: `Valid ${result.lineType} number, but may not receive SMS.`,
        data: result
      };
    } else {
      console.log('❌ Phone number is invalid');
      return {
        success: false,
        message: 'Invalid phone number',
        data: result
      };
    }
  } catch (error) {
    console.error('❌ Validation error:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

// Example usage in browser console:
// import { testPhoneValidation } from './utils/testPhoneValidation';
// testPhoneValidation('+14158586273').then(console.log);

