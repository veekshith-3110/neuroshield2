# Fix Network Error - Backend Connection

## Problem
"Network error: Failed to fetch. Please check if the backend server is running on port 5000."

## Solution

### Step 1: Start Backend Server

**Option A: Use PowerShell Script**
```powershell
.\start-backend.ps1
```

**Option B: Manual Start**
```powershell
cd backend
node server.js
```

### Step 2: Verify Backend is Running

Open a new terminal and check:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000" -Method GET
```

You should see a JSON response with API information.

### Step 3: Start Frontend

In a separate terminal:
```powershell
npm start
```

## Quick Fix Script

Run this to start both servers:
```powershell
# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; node server.js"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start frontend
npm start
```

## Common Issues

1. **Port 5000 already in use:**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Backend not starting:**
   - Check if `backend/.env` exists
   - Check if `node_modules` are installed: `cd backend; npm install`

3. **CORS errors:**
   - Backend CORS is configured for `localhost:3000` and `localhost:3001`
   - Make sure frontend runs on one of these ports

## Verification

✅ Backend running: http://localhost:5000
✅ Frontend running: http://localhost:3000 or http://localhost:3001
✅ .env file has: `REACT_APP_BACKEND_URL=http://localhost:5000`

---

**The backend must be running before you can use login/signup!**

