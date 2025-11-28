# Testing Login Flow

## Quick Test Steps

1. **Open Browser Console** (F12)
2. **Clear localStorage** (optional):
   ```javascript
   localStorage.clear()
   ```
3. **Try to Login/Signup**:
   - Enter any email (e.g., `test@example.com`)
   - Enter any password (e.g., `Test123!@#`)
   - Click "Sign Up" (not Login, since user doesn't exist yet)

## What to Check in Console

You should see these logs:
- `✅ Terms accepted, proceeding with login/signup`
- `📤 Login attempt: { isLogin: false, identifier: "...", hasPassword: true }`
- `📝 Calling signup function...`
- `🔐 Attempting signup to: http://localhost:5000/api/auth/signup`
- `📤 Sending: { identifier: "...", password: "***", name: "..." }`
- `📥 Response status: 201`
- `📥 Response data: { success: true, token: "...", user: {...} }`
- `✅ Signup successful, navigating to dashboard`

## Backend Logs

In the backend terminal, you should see:
- `📝 Signup request received: { identifier: "...", hasPassword: true, name: "...", userStoreSize: 0 }`
- `✅ Creating new user...`
- `✅ Signup successful, user created: ...`

## Troubleshooting

### If you see "Network error":
- Check if backend is running: `http://localhost:5000/api/health-check`
- Check browser console for CORS errors
- Verify backend URL in `.env` or `AuthContext.js`

### If you see "Terms not accepted":
- Accept the terms in the modal, OR
- Run in console: `localStorage.setItem('skipTerms', 'true')` (temporary bypass)

### If login fails after signup:
- Make sure you're using the same email/password
- Check backend logs for errors
- Verify user was created in backend

## Expected Flow

1. **First Time User (Sign Up)**:
   - Fill form → Click "Sign Up"
   - Terms modal appears → Accept terms
   - Backend creates user → Returns token
   - Redirects to dashboard

2. **Existing User (Login)**:
   - Fill form → Click "Sign In"
   - Terms already accepted → Direct backend call
   - Backend validates → Returns token
   - Redirects to dashboard

