# Production Deployment Guide

## ✅ Guest Login Works After Deployment

The app now supports **guest mode** which works completely offline and doesn't require backend connection. This ensures the app works even if the backend is not deployed or unavailable.

## 🔧 Configuration for Production

### Frontend Environment Variables

Set these in your deployment platform (Vercel, Netlify, etc.):

```env
REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important**: 
- If `REACT_APP_BACKEND_URL` is not set, the app will default to `http://localhost:5000` (for development)
- Guest mode works **without** backend connection
- Regular login/signup requires backend to be available

### Backend Environment Variables

Set these in your backend deployment platform:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://www.your-frontend-url.vercel.app
GOOGLE_AI_API_KEY=your-google-ai-api-key
JWT_SECRET=your-secure-jwt-secret
PORT=5000
```

**CORS Configuration**:
- `ALLOWED_ORIGINS`: Comma-separated list of frontend URLs
- Example: `https://neuroshield.vercel.app,https://www.neuroshield.vercel.app`
- If not set, defaults to localhost (development mode)

## 🚀 Deployment Steps

### 1. Deploy Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set environment variables:
   - `REACT_APP_BACKEND_URL` (your backend URL)
   - `REACT_APP_GOOGLE_CLIENT_ID` (your Google OAuth client ID)
3. Deploy

### 2. Deploy Backend (Vercel/Railway/Render)

1. Deploy the `backend/` directory
2. Set environment variables:
   - `ALLOWED_ORIGINS` (your frontend URLs)
   - `GOOGLE_AI_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
3. Get your backend URL (e.g., `https://neuroshield-backend.vercel.app`)

### 3. Update Frontend Environment

1. Go back to frontend deployment settings
2. Update `REACT_APP_BACKEND_URL` with your actual backend URL
3. Redeploy frontend

### 4. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add **Authorized JavaScript origins**:
   ```
   https://your-frontend-url.vercel.app
   https://www.your-frontend-url.vercel.app
   ```
5. Add **Authorized redirect URIs**:
   ```
   https://your-frontend-url.vercel.app
   https://your-frontend-url.vercel.app/login
   https://your-frontend-url.vercel.app/dashboard
   ```
6. Save and wait 1-2 minutes

## ✅ Features That Work Without Backend

- ✅ Guest login (completely offline)
- ✅ Dashboard navigation
- ✅ Daily log form (saves to localStorage)
- ✅ Health dashboard (uses local data)
- ✅ Screen time tracking (local)
- ✅ Stress detection (local)
- ✅ Anti-doze detection (local)
- ✅ All UI features

## ⚠️ Features That Require Backend

- ❌ Regular login/signup (needs backend)
- ❌ Google OAuth login (needs backend)
- ❌ AI Mentor chat (needs backend)
- ❌ Health data sync from Android (needs backend)
- ❌ Data persistence across devices (needs backend)

## 🔍 Testing After Deployment

### Test Guest Login
1. Visit your deployed frontend URL
2. Click "Continue as Guest"
3. Should navigate to dashboard immediately
4. All features should work (using localStorage)

### Test Regular Login
1. Visit your deployed frontend URL
2. Try to login with email/password
3. Should connect to backend
4. If backend is not available, will show error message

### Test Google Login
1. Visit your deployed frontend URL
2. Click "Sign in with Google"
3. Should redirect to Google OAuth
4. After authentication, should redirect back to your app

## 🐛 Troubleshooting

### Guest Login Not Working
- Should work immediately (no backend needed)
- Check browser console for errors
- Clear browser cache and try again

### Regular Login Fails
- Check `REACT_APP_BACKEND_URL` is set correctly
- Verify backend is deployed and running
- Check backend CORS settings
- Check browser console for network errors

### Google Login Fails
- Verify Google OAuth URLs are added in Google Cloud Console
- Check `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
- Wait 1-2 minutes after updating Google Console settings
- Clear browser cache

### CORS Errors
- Verify `ALLOWED_ORIGINS` in backend includes your frontend URL
- Check backend logs for CORS errors
- Ensure URLs match exactly (including https://)

## 📝 Notes

- **Guest mode is production-ready** and works completely offline
- Backend is optional for basic app functionality
- Users can explore the app as guests, then login later to save data
- All local features work without backend connection

