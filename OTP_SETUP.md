# OTP.dev API Setup Guide

## ✅ Integration Complete!

The OTP.dev API has been integrated for email and phone number login with OTP verification.

## Setup Instructions

### 1. Get Your OTP.dev API Key

1. Go to https://otp.dev
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key

### 2. Add API Key to Environment Variables

Create or update your `.env` file in the project root:

```env
REACT_APP_OTP_API_KEY=your_otp_dev_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### 3. Restart Development Server

After adding the API key, restart your server:

```bash
npm start
```

## Features Implemented

### ✅ OTP Login
- Users can login with **email OR phone number**
- Toggle between "Password" and "OTP (Email/SMS)" login methods
- OTP sent via email or SMS based on input
- 6-digit OTP verification

### ✅ Forgot Password with OTP
- Supports email or phone number
- OTP verification before password reset
- Secure password reset flow

## How It Works

### Login Flow (OTP Method)

1. User selects "OTP (Email/SMS)" login method
2. Enters email or phone number
3. Clicks "Send OTP"
4. Receives OTP code via email or SMS
5. Enters 6-digit code
6. Clicks "Verify OTP"
7. Automatically logged in upon verification

### Phone Number Format

- Phone numbers should be in E.164 format: `+1234567890`
- The app automatically formats phone numbers
- Country code is required (defaults to +1 for US)

### Email Format

- Standard email format: `user@example.com`

## API Endpoints Used

### Send OTP
```
POST https://api.otp.dev/v1/verifications
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "identifier": "user@example.com" or "+1234567890",
    "channel": "email" or "sms"
  }
```

### Verify OTP
```
POST https://api.otp.dev/v1/verifications/{verification_id}/verify
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "code": "123456"
  }
```

## Code Structure

### Files Created/Updated

1. **`src/utils/otpService.js`** - OTP.dev API service functions
   - `sendOTP()` - Send OTP to email/phone
   - `verifyOTP()` - Verify OTP code
   - `getChannelType()` - Detect email vs phone
   - `formatPhoneNumber()` - Format to E.164

2. **`src/components/Login.js`** - Updated with OTP login
   - Login method toggle (Password/OTP)
   - OTP request and verification flow
   - Email/phone input support

3. **`src/components/ForgotPassword.js`** - Updated with OTP.dev
   - Email/phone support for password reset
   - OTP verification before password change

## Testing

### Test Email OTP
1. Select "OTP (Email/SMS)" login
2. Enter: `your@email.com`
3. Click "Send OTP"
4. Check your email for the code
5. Enter code and verify

### Test SMS OTP
1. Select "OTP (Email/SMS)" login
2. Enter: `+1234567890` (your phone number)
3. Click "Send OTP"
4. Check your SMS for the code
5. Enter code and verify

## Troubleshooting

### "OTP API key not configured" Error
- Make sure `.env` file exists in project root
- Check that `REACT_APP_OTP_API_KEY` is set
- Restart the development server after adding the key

### OTP Not Received
- Check spam folder for emails
- Verify phone number format (must include country code)
- Check OTP.dev dashboard for delivery status
- Ensure API key has correct permissions

### Invalid OTP Code
- OTP codes expire after 5 minutes (default)
- Codes are 6 digits
- Make sure you're using the latest code sent

## Security Notes

- OTP codes expire after 5 minutes
- Rate limiting is handled by OTP.dev
- Phone numbers are automatically formatted to E.164
- All API calls use HTTPS

## OTP.dev Free Tier

- **Free tier includes**: Limited verifications per month
- **Upgrade**: For production use, consider upgrading your plan
- **Documentation**: https://otp.dev/docs/

## Next Steps

1. ✅ Get API key from otp.dev
2. ✅ Add to `.env` file
3. ✅ Restart server
4. ✅ Test email OTP login
5. ✅ Test SMS OTP login
6. ✅ Test forgot password with OTP

Your OTP login is ready to use! 🎉

