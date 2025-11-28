# Email API Integration Guide for Password Reset

This guide explains how to integrate email services to send password reset codes.

## Current Implementation

The Forgot Password component (`src/components/ForgotPassword.js`) is ready but needs a backend API to actually send emails. Currently, it simulates the email sending process.

## Recommended Email Services

### 1. **SendGrid** (Recommended for beginners)
- **Free Tier**: 100 emails/day
- **Setup Time**: ~15 minutes
- **Best for**: Small to medium applications

### 2. **AWS SES** (Amazon Simple Email Service)
- **Free Tier**: 62,000 emails/month (first year)
- **Setup Time**: ~30 minutes
- **Best for**: Scalable applications

### 3. **Mailgun**
- **Free Tier**: 5,000 emails/month (first 3 months)
- **Setup Time**: ~20 minutes
- **Best for**: Developer-friendly APIs

### 4. **Resend**
- **Free Tier**: 3,000 emails/month
- **Setup Time**: ~10 minutes
- **Best for**: Modern applications with great DX

## Implementation Steps

### Option 1: Using SendGrid (Easiest)

#### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for a free account
3. Verify your email

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "Password Reset"
4. Give it "Mail Send" permissions
5. Copy the API key (you'll only see it once!)

#### Step 3: Create Backend Endpoint

Create a Node.js/Express endpoint:

```javascript
// server.js or routes/auth.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // Generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code in database with expiration (e.g., 15 minutes)
  // await db.saveResetCode(email, resetCode);
  
  // Send email
  const msg = {
    to: email,
    from: 'noreply@yourdomain.com', // Must be verified in SendGrid
    subject: 'Password Reset Code',
    html: `
      <h2>Password Reset Request</h2>
      <p>Your password reset code is: <strong>${resetCode}</strong></p>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };
  
  try {
    await sgMail.send(msg);
    res.json({ success: true, message: 'Reset code sent to email' });
  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  // Verify code from database
  // const isValid = await db.verifyResetCode(email, code);
  
  if (isValid) {
    // Update password
    // await db.updatePassword(email, newPassword);
    res.json({ success: true, message: 'Password reset successful' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid or expired code' });
  }
});
```

#### Step 4: Install SendGrid Package
```bash
npm install @sendgrid/mail
```

#### Step 5: Update Frontend

Update `src/components/ForgotPassword.js`:

```javascript
// Replace the simulated API calls with real ones:

const handleRequestCode = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessage(`Reset code sent to ${email}. Please check your inbox.`);
      setStep('verify');
    } else {
      setError(data.error || 'Failed to send reset code');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

const handleVerifyCode = async (e) => {
  e.preventDefault();
  // ... validation code ...
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: resetCode, newPassword })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessage('Password reset successful!');
      setTimeout(() => onClose(), 2000);
    } else {
      setError(data.error || 'Invalid reset code');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  }
};
```

### Option 2: Using AWS SES

#### Step 1: Setup AWS SES
1. Go to AWS Console → SES
2. Verify your email address or domain
3. Create IAM user with SES permissions
4. Get Access Key ID and Secret

#### Step 2: Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

#### Step 3: Backend Code
```javascript
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const params = {
    Source: 'noreply@yourdomain.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Password Reset Code' },
      Body: {
        Html: {
          Data: `<h2>Your reset code is: ${resetCode}</h2>`
        }
      }
    }
  };
  
  try {
    await sesClient.send(new SendEmailCommand(params));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Option 3: Using Resend (Modern & Simple)

#### Step 1: Sign up at https://resend.com

#### Step 2: Get API Key

#### Step 3: Install Package
```bash
npm install resend
```

#### Step 4: Backend Code
```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Password Reset Code',
      html: `<p>Your reset code is: <strong>${resetCode}</strong></p>`
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Security Best Practices

1. **Code Expiration**: Reset codes should expire after 15-30 minutes
2. **Rate Limiting**: Limit password reset requests (e.g., 3 per hour per email)
3. **Code Storage**: Store codes hashed in database, not plain text
4. **HTTPS Only**: Always use HTTPS in production
5. **Email Validation**: Verify email exists before sending
6. **Logging**: Log all password reset attempts for security

## Database Schema Example

```sql
CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL, -- Hashed
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

Create `.env` file in your backend:

```env
# SendGrid
SENDGRID_API_KEY=your_api_key_here

# OR AWS SES
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

# OR Resend
RESEND_API_KEY=your_api_key_here
```

## Testing

For development, you can use:
- **Mailtrap**: Catches all emails in development
- **Ethereal Email**: Generates fake SMTP for testing
- **Nodemailer**: For local testing without external services

## Quick Start Recommendation

For fastest setup, use **Resend**:
1. Sign up (2 minutes)
2. Get API key (1 minute)
3. Install package: `npm install resend`
4. Copy backend code from above
5. Done!

## Need Help?

- SendGrid Docs: https://docs.sendgrid.com
- AWS SES Docs: https://docs.aws.amazon.com/ses
- Resend Docs: https://resend.com/docs

