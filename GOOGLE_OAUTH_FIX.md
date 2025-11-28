# Fix Google OAuth "origin_mismatch" Error

## Error Explanation

**Error 400: origin_mismatch** means the URL where your app is running is not registered in Google Cloud Console.

## Quick Fix Steps

### 1. Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project: **nexathon-479607**

### 2. Navigate to OAuth Settings

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID: `YOUR_CLIENT_ID_HERE`
3. Click on it to edit

### 3. Add Authorized JavaScript Origins

Click **+ ADD URI** and add these origins:

**For Development:**
```
http://localhost:3000
http://127.0.0.1:3000
```

**For Production (when you deploy):**
```
https://yourdomain.com
https://www.yourdomain.com
```

### 4. Add Authorized Redirect URIs

Make sure these redirect URIs are added:

**For Development:**
```
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/dashboard
```

**For Production:**
```
https://yourdomain.com
https://yourdomain.com/login
https://yourdomain.com/dashboard
```

### 5. Save Changes

- Click **SAVE** at the bottom
- Wait 1-2 minutes for changes to propagate

### 6. Test Again

1. Clear browser cache
2. Try Google login again
3. Should work now!

## Current Configuration

Based on your credentials:
- **Client ID**: `YOUR_CLIENT_ID_HERE`
- **Project ID**: `nexathon-479607`
- **Current Redirect URI**: `http://localhost:3000/login`

## Common Issues

### Issue 1: Port Mismatch
- If running on different port (e.g., 3001), add that too:
  ```
  http://localhost:3001
  ```

### Issue 2: HTTP vs HTTPS
- Development: Use `http://`
- Production: Use `https://`
- Don't mix them!

### Issue 3: Trailing Slash
- Add both with and without trailing slash:
  ```
  http://localhost:3000
  http://localhost:3000/
  ```

### Issue 4: Changes Not Applied
- Wait 1-2 minutes after saving
- Clear browser cache
- Try incognito/private window

## Verification Checklist

✅ JavaScript origins include: `http://localhost:3000`  
✅ Redirect URIs include: `http://localhost:3000/login`  
✅ Changes saved in Google Cloud Console  
✅ Waited 1-2 minutes for propagation  
✅ Cleared browser cache  
✅ Tried in incognito window  

## Still Not Working?

1. **Check browser console** for exact error
2. **Verify Client ID** in `.env` matches Google Console
3. **Check network tab** for the exact origin being used
4. **Try different browser** to rule out cache issues

## Production Deployment

When deploying to production (Vercel/Netlify), add:
- Your production domain to JavaScript origins
- Your production domain to redirect URIs
- Update `.env` with production URLs if needed

