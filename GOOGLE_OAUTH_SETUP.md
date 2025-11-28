# Google OAuth Setup Instructions

## ✅ Setup Complete!

The Google OAuth integration has been configured. Follow these steps to enable it:

### 1. Create `.env` file

Create a `.env` file in the root directory (`C:\Users\vemul\OneDrive\Desktop\Nexathon\.env`) with the following content:

```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### 2. Restart the Development Server

After creating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### 3. Verify Setup

- The Google Sign-In button should appear on the login page
- Clicking it should open Google's OAuth consent screen
- After authentication, you'll be redirected to the dashboard

## What's Been Configured

✅ `@react-oauth/google` package installed  
✅ `GoogleOAuthProvider` added to `src/index.js`  
✅ `GoogleLogin` component integrated in `src/components/Login.js`  
✅ AuthContext updated to handle Google OAuth responses  
✅ Client ID configured: `YOUR_CLIENT_ID_HERE`

## OAuth Credentials

- **Client ID**: `YOUR_CLIENT_ID_HERE`
- **Project ID**: `nexathon-479607`
- **Redirect URI**: `http://localhost:3000/login`
- **JavaScript Origins**: `http://localhost:3000`

## Troubleshooting

If Google login doesn't work:

1. **Check `.env` file exists** and has the correct Client ID
2. **Restart the dev server** after creating/updating `.env`
3. **Clear browser cache** and try again
4. **Check browser console** for any error messages
5. **Verify** the redirect URI matches exactly: `http://localhost:3000/login`

## Notes

- The `.env` file is in `.gitignore` and won't be committed to git
- For production, update the redirect URIs in Google Cloud Console
- The Client Secret should NEVER be exposed in frontend code

