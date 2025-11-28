# EmailJS Setup Guide

## Overview

The application now uses EmailJS to send burnout alert emails directly from the frontend, eliminating the need for a backend server.

## Quick Setup

### 1. Create EmailJS Account

1. Go to: https://www.emailjs.com/
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

### 2. Create Email Service

1. Go to **Email Services** in EmailJS dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. **Copy the Service ID** (e.g., `service_xxxxxxx`)

### 3. Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template structure:

**Subject:**
```
⚠️ High Digital Burnout Risk Detected
```

**Content:**
```
Hi,

Your burnout indicators seem high:

- Screen time: {{screen_time}} hours
- Sleep: {{sleep_hours}} hours
- Mood: {{mood}}
- Risk score: {{risk_score}}

Please take a short break, hydrate, and disconnect from screens for a while.
You matter more than your notifications. 💙

– Digital Burnout Early-Warning System
```

4. **Copy the Template ID** (e.g., `template_xxxxxxx`)

### 4. Get Public Key

1. Go to **Account** → **General**
2. Find **Public Key**
3. **Copy the Public Key** (e.g., `xxxxxxxxxxxxx`)

### 5. Configure Environment Variables

Add to your `.env` file:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

**Example:**
```env
REACT_APP_EMAILJS_SERVICE_ID=service_abc123
REACT_APP_EMAILJS_TEMPLATE_ID=template_xyz789
REACT_APP_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

### 6. Restart Development Server

After adding environment variables:

```bash
npm start
```

## Template Variables

The email template uses these variables:

- `{{to_email}}` - Recipient email address
- `{{screen_time}}` - Screen time in hours
- `{{sleep_hours}}` - Sleep hours
- `{{mood}}` - User's mood
- `{{risk_score}}` - Calculated risk score

## How It Works

1. User submits daily check-in with `riskScore > 7`
2. `sendAlertEmail()` function is called
3. EmailJS sends email using your configured service
4. Email is delivered to the user's email address

## Code Integration

### Email Service (`src/utils/emailService.js`)

```javascript
import emailjs from "emailjs-com";

export function sendAlertEmail({ email, screenTime, sleep, mood, riskScore }) {
  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

  return emailjs.send(
    serviceId,
    templateId,
    {
      to_email: email,
      screen_time: screenTime,
      sleep_hours: sleep,
      mood,
      risk_score: riskScore,
    },
    publicKey
  );
}
```

### Usage in Component

```javascript
import { sendAlertEmail } from '../utils/emailService';

// In handleSubmit function
if (riskScore > 7 && user?.email) {
  try {
    await sendAlertEmail({
      email: user.email,
      screenTime,
      sleep,
      mood,
      riskScore,
    });
    console.log('Burnout alert email sent successfully');
  } catch (error) {
    console.warn('Failed to send burnout alert email:', error);
  }
}
```

## Testing

### Test Email Sending

1. Fill in daily check-in with values that result in `riskScore > 7`:
   - Sleep: < 6 hours
   - Screen Time: > 6 hours
   - Mood: "Stressed"

2. Submit the form

3. Check browser console for:
   - "Burnout alert email sent successfully" ✅
   - Or error message if something went wrong

4. Check the recipient's email inbox for the alert

### Test Template Variables

You can test your template in EmailJS dashboard:
1. Go to **Email Templates**
2. Click **Test** on your template
3. Fill in test values:
   - `to_email`: your-test-email@example.com
   - `screen_time`: 9
   - `sleep_hours`: 5
   - `mood`: Stressed
   - `risk_score`: 8

## Troubleshooting

### Error: "Invalid service ID"
- ✅ Check `REACT_APP_EMAILJS_SERVICE_ID` in `.env`
- ✅ Verify service ID in EmailJS dashboard
- ✅ Restart dev server after updating `.env`

### Error: "Invalid template ID"
- ✅ Check `REACT_APP_EMAILJS_TEMPLATE_ID` in `.env`
- ✅ Verify template ID in EmailJS dashboard
- ✅ Make sure template variables match

### Error: "Invalid public key"
- ✅ Check `REACT_APP_EMAILJS_PUBLIC_KEY` in `.env`
- ✅ Verify public key in EmailJS account settings
- ✅ Make sure there are no extra spaces

### Email not received
- ✅ Check spam/junk folder
- ✅ Verify email service is connected in EmailJS
- ✅ Check EmailJS dashboard for delivery status
- ✅ Verify template variables are correct

### Rate Limit Exceeded
- ✅ Free plan: 200 emails/month
- ✅ Upgrade to paid plan for more emails
- ✅ Check usage in EmailJS dashboard

## EmailJS Free Plan Limits

- **200 emails/month**
- **2 email services**
- **Unlimited templates**
- **Email delivery tracking**

## Advantages of EmailJS

✅ **No backend required** - Sends emails directly from frontend  
✅ **Easy setup** - No server configuration needed  
✅ **Free tier** - 200 emails/month free  
✅ **Multiple providers** - Gmail, Outlook, SendGrid, etc.  
✅ **Template management** - Visual template editor  
✅ **Delivery tracking** - See email status in dashboard  

## Migration from Backend API

If you were using the Express backend (`server.js`), you can now:
- ✅ Remove the backend server (optional)
- ✅ Use EmailJS instead
- ✅ No need to configure Gmail App Passwords
- ✅ Simpler deployment (frontend only)

## Production Deployment

For production:
1. ✅ Use production EmailJS account
2. ✅ Update `.env` with production credentials
3. ✅ Test email delivery
4. ✅ Monitor email usage in EmailJS dashboard

---

**Note**: Make sure to add `.env` to `.gitignore` to keep your credentials secure!

