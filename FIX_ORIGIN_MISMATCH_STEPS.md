# 🔧 Fix "origin_mismatch" Error - Step by Step Guide

## Error Explanation
**Error 400: origin_mismatch** means the URL where your app is running (`http://localhost:3000`) is NOT registered in Google Cloud Console.

## ✅ Step-by-Step Fix

### Step 1: Open Google Cloud Console
1. Go to: **https://console.cloud.google.com/**
2. Make sure you're signed in with the correct Google account
3. Select your project: **nexathon-479607**

### Step 2: Navigate to OAuth Credentials
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"** (or go directly: https://console.cloud.google.com/apis/credentials)
3. You'll see a list of OAuth 2.0 Client IDs

### Step 3: Find Your OAuth Client
1. Look for the Client ID: `YOUR_CLIENT_ID_HERE`
2. **Click on the Client ID name** (not the edit icon, click the name itself)
   - OR click the **pencil/edit icon** (✏️) next to it

### Step 4: Add Authorized JavaScript Origins
1. Scroll down to **"Authorized JavaScript origins"**
2. Click **"+ ADD URI"** button
3. Add these EXACT URLs (one at a time, or all at once):
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
4. **Important**: 
   - Use `http://` NOT `https://`
   - No trailing slash: `http://localhost:3000` (NOT `http://localhost:3000/`)
   - Make sure there are no spaces

### Step 5: Add Authorized Redirect URIs
1. Scroll down to **"Authorized redirect URIs"**
2. Click **"+ ADD URI"** button
3. Add these EXACT URLs:
   ```
   http://localhost:3000
  
   ```
4. **Important**: Same rules as above - `http://`, no trailing slash

### Step 6: Save Changes
1. Scroll to the **bottom** of the page
2. Click **"SAVE"** button
3. Wait **1-2 minutes** for changes to propagate (Google needs time to update)

### Step 7: Verify Your Settings
After saving, your configuration should look like this:

**Authorized JavaScript origins:**
- ✅ `http://localhost:3000`
- ✅ `http://127.0.0.1:3000`

**Authorized redirect URIs:**
- ✅ `http://localhost:3000`
- ✅ `http://localhost:3000/login`
- ✅ `http://localhost:3000/dashboard`

### Step 8: Test Again
1. **Wait 1-2 minutes** after saving
2. **Clear your browser cache**:
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"
3. **Or use Incognito/Private window** (Ctrl+Shift+N)
4. Go to: http://localhost:3000/login
5. Try Google login again

## 🎯 Quick Checklist

Before testing, verify:
- [ ] JavaScript origin `http://localhost:3000` is added
- [ ] Redirect URI `http://localhost:3000/login` is added
- [ ] Changes are SAVED in Google Cloud Console
- [ ] Waited 1-2 minutes after saving
- [ ] Cleared browser cache or using incognito
- [ ] Development server is running on port 3000

## 🔍 Common Mistakes to Avoid

❌ **DON'T** use `https://localhost:3000` (use `http://`)  
❌ **DON'T** add trailing slash: `http://localhost:3000/`  
❌ **DON'T** forget to click SAVE  
❌ **DON'T** test immediately (wait 1-2 minutes)  
❌ **DON'T** forget to clear browser cache  

✅ **DO** use `http://localhost:3000`  
✅ **DO** wait 1-2 minutes after saving  
✅ **DO** clear browser cache  
✅ **DO** verify the URLs match exactly  

## 📸 Visual Guide

If you need help finding the settings:

1. **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID
3. Click on it to edit
4. Look for:
   - **"Authorized JavaScript origins"** section
   - **"Authorized redirect URIs"** section
5. Add the URLs and SAVE

## 🆘 Still Not Working?

If you still get the error after following all steps:

1. **Double-check the exact URL** in your browser address bar
   - Should be: `http://localhost:3000/login`
   - NOT: `https://localhost:3000/login`
   - NOT: `http://localhost:3001/login` (different port)

2. **Check browser console** (F12) for exact error message

3. **Verify your OAuth Client ID** matches:
   - In Google Console: `YOUR_CLIENT_ID_HERE`
   - In your `.env` file: Same Client ID

4. **Try a different browser** (Chrome, Firefox, Edge)

5. **Check if port is different**:
   - If your app runs on port 3001, add `http://localhost:3001` instead

## ✅ Expected Result

After fixing, when you click "Sign in with Google":
- ✅ Google consent screen appears
- ✅ You can select your account
- ✅ You're redirected back to the dashboard
- ✅ No "origin_mismatch" error

---

**Follow these steps carefully and the error will be fixed!** 🎉

