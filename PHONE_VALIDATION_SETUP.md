# Phone Number Validation API Setup

## Overview

The app now includes phone number validation before sending OTP messages. This ensures:
- Phone numbers are valid and can receive SMS
- Numbers are properly formatted (E.164)
- Invalid numbers are caught before sending OTP

## API Response Format

The validation API returns data like:
```json
{
  "valid": true,
  "local_format": "4158586273",
  "intl_format": "+14158586273",
  "country_code": "US",
  "country_name": "United States of America",
  "location": "Novato",
  "carrier": "AT&T Mobility LLC",
  "line_type": "mobile"
}
```

## Supported APIs

### Option 1: Numverify (Recommended)
- **URL**: https://numverify.com
- **Free Tier**: 1,000 requests/month
- **Setup**:
  1. Sign up at https://numverify.com
  2. Get your API key
  3. Add to `.env`:
     ```
     REACT_APP_PHONE_VALIDATION_API_KEY=your_numverify_api_key
     ```

### Option 2: AbstractAPI
- **URL**: https://www.abstractapi.com/phone-validation-api
- **Free Tier**: 250 requests/month
- **Setup**:
  1. Sign up at https://www.abstractapi.com
  2. Get your API key
  3. Update `src/utils/phoneValidator.js`:
     ```javascript
     const PHONE_VALIDATION_API = 'https://phonevalidation.abstractapi.com/v1/';
     ```
  4. Add to `.env`:
     ```
     REACT_APP_PHONE_VALIDATION_API_KEY=your_abstract_api_key
     ```

### Option 3: Twilio Lookup
- **URL**: https://www.twilio.com/docs/lookup
- **Setup**: Requires Twilio account and different API structure

## Current Implementation

The phone validation is integrated into the OTP sending flow:

1. **Before sending OTP**: Phone number is validated
2. **Validation checks**:
   - Is the number valid?
   - Can it receive SMS? (mobile/landline check)
   - Proper formatting (E.164)
3. **If valid**: OTP is sent using formatted number
4. **If invalid**: Error message shown to user

## Environment Variables

Add to your `.env` file:

```env
# OTP.dev API (for sending OTP)
REACT_APP_OTP_API_KEY=your_otp_dev_api_key

# Phone Validation API (optional but recommended)
REACT_APP_PHONE_VALIDATION_API_KEY=your_phone_validation_api_key
REACT_APP_PHONE_VALIDATION_API=https://api.numverify.com/v1/validate
```

## How It Works

1. User enters phone number: `4158586273` or `+14158586273`
2. System validates number via API
3. API returns validation data (carrier, country, line type, etc.)
4. System checks if number can receive SMS
5. If valid and SMS-capable, OTP is sent
6. If invalid, user sees error message

## Testing

### Test with Valid Number
- Enter: `+14158586273` (US mobile number)
- Should validate successfully
- OTP should be sent

### Test with Invalid Number
- Enter: `1234567890` (invalid)
- Should show validation error
- OTP will not be sent

## Fallback Behavior

If phone validation API is not configured:
- Validation is skipped
- OTP sending proceeds normally
- Warning logged in console

This allows the app to work without validation API, but validation is recommended for production.

## API Response Fields Used

- `valid`: Boolean - Is the number valid?
- `intl_format`: String - E.164 formatted number (used for OTP)
- `line_type`: String - 'mobile', 'landline', etc.
- `canSendSMS`: Boolean - Can this number receive SMS?
- `carrier`: String - Phone carrier information
- `country_name`: String - Country of the number

## Notes

- Phone validation happens **before** sending OTP
- Invalid numbers are rejected with clear error messages
- Validated numbers are automatically formatted to E.164
- Validation is optional - app works without it but with less security

