# Quick Start Guide - Fix Network Error

## ✅ Solution: Start Backend Server

The "Network error: Failed to fetch" occurs because the **backend server is not running**.

## 🚀 Quick Fix

### Option 1: Use the Script (Recommended)
```powershell
.\start-all.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```powershell
npm start
```

## ✅ Verification

1. **Check Backend:**
   - Open: http://localhost:5000
   - Should see: `{"message":"NeuroShield API","version":"1.0.0",...}`

2. **Check Frontend:**
   - Open: http://localhost:3000
   - Login page should load
   - No network errors in console

## 📋 Requirements

- ✅ Backend must run on port 5000
- ✅ Frontend must run on port 3000 or 3001
- ✅ `.env` file must have: `REACT_APP_BACKEND_URL=http://localhost:5000`

## 🔧 If Still Getting Errors

1. **Stop all Node processes:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Start backend first:**
   ```powershell
   cd backend
   node server.js
   ```

3. **Wait 3-5 seconds, then start frontend:**
   ```powershell
   npm start
   ```

---

**The backend MUST be running before the frontend can connect!**
