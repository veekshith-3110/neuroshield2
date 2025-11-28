# Quick Fix for Login Issues

## If Login/Signup is Not Working:

### 1. **Bypass Terms for Testing** (Temporary)
Open browser console (F12) and run:
```javascript
localStorage.setItem('skipTerms', 'true')
```
Then refresh the page and try again.

### 2. **Check Backend is Running**
```bash
# In backend folder
node server.js
```
Should see: `🚀 Backend server listening on http://0.0.0.0:5000`

### 3. **Check Browser Console**
Open F12 → Console tab
Look for:
- `🔐 Attempting login/signup to: http://localhost:5000/api/auth/...`
- `📥 Response status: ...`
- Any red error messages

### 4. **Common Issues & Fixes**

#### Issue: "Network error" or CORS error
**Fix**: Make sure backend is running and CORS is enabled
- Backend should have: `app.use(cors());`

#### Issue: "Terms not accepted"
**Fix**: 
- Accept terms in modal, OR
- Run: `localStorage.setItem('skipTerms', 'true')`

#### Issue: "Invalid email/phone or password"
**Fix**: 
- For new users: Use "Sign Up" not "Login"
- For existing users: Make sure you're using correct credentials

#### Issue: "Password does not meet requirements"
**Fix**: Password must have:
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character (!@#$%^&*)

### 5. **Test Signup Flow**
1. Click "Sign Up" tab
2. Enter:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `Test123!@#`
3. Click "Sign Up"
4. Accept Terms
5. Should redirect to dashboard

### 6. **Check Backend Logs**
In backend terminal, you should see:
- `📝 Signup request received: ...`
- `✅ Signup successful, user created: ...`

### 7. **Clear Everything and Start Fresh**
```javascript
// In browser console
localStorage.clear()
// Then refresh page
```

## Debugging Steps:

1. ✅ Backend running? → Check `http://localhost:5000/api/health-check`
2. ✅ Frontend running? → Check `http://localhost:3000`
3. ✅ Terms bypassed? → `localStorage.getItem('skipTerms')`
4. ✅ Check console errors? → F12 → Console tab
5. ✅ Check network tab? → F12 → Network tab → Look for `/api/auth/` requests

