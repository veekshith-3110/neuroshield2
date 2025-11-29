# Environment Variables for Deployment

Copy these environment variables to your deployment platform (Netlify, Vercel, Render, Railway, etc.)

## Required Variables

```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=314956634142-hd0uomrgp5s8nor3vdj8a6arqjae8bno.apps.googleusercontent.com
```

## Optional Variables

```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
REACT_APP_OTP_API_KEY=your_otp_api_key
REACT_APP_PHONE_VALIDATION_API=https://api.numverify.com/v1/validate
REACT_APP_PHONE_VALIDATION_API_KEY=your_api_key
REACT_APP_API_URL=
```

## Platform-Specific Instructions

### Netlify
1. Go to Site settings > Environment variables
2. Add each variable with the `REACT_APP_` prefix
3. Redeploy after adding variables

### Vercel
1. Go to Project settings > Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy after adding variables

### Render
1. Go to Environment tab in your service
2. Add each variable
3. Manual deploy after adding variables

### Railway
1. Go to Variables tab
2. Add each variable
3. Redeploy after adding variables

## Important Notes

- All React environment variables MUST start with `REACT_APP_`
- Variables are embedded at build time, not runtime
- You must rebuild/redeploy after changing environment variables
- For production, update `REACT_APP_BACKEND_URL` to your production backend URL

