# Fix Backend Connection Error

## Problem
"Network error: Failed to fetch. Please check if the backend server is running on port 5000."

## Solution Steps

### Step 1: Start the Backend Server

**Option A: Using PowerShell Script (Easiest)**
```powershell
cd C:\Users\vemul\OneDrive\Desktop\Nexathon
.\start-backend.ps1
```

**Option B: Manual Start**
1. Open a new PowerShell window
2. Navigate to backend folder:
   ```powershell
   cd C:\Users\vemul\OneDrive\Desktop\Nexathon\backend
   ```
3. Start the server:
   ```powershell
   node server.js
   ```

### Step 2: Verify Backend is Running

Open a new PowerShell window and run:
```powershell
cd C:\Users\vemul\OneDrive\Desktop\Nexathon
.\test-backend-connection.ps1
```

Or test manually:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health-check" -UseBasicParsing
```

### Step 3: Check Environment Variables

Make sure `.env` file exists in the root directory with:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Step 4: Restart Frontend (if needed)

If backend is running but frontend still shows error:
1. Stop frontend (Ctrl+C)
2. Restart:
   ```powershell
   npm start
   ```

## Common Issues

### Issue 1: Port 5000 Already in Use
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 2: Backend Not Starting
**Check:**
1. Are you in the `backend` folder?
2. Are dependencies installed? (`npm install` in backend folder)
3. Check for error messages in the backend console

### Issue 3: CORS Errors
**Solution:** Backend is already configured for CORS. Make sure:
- Backend is running on port 5000
- Frontend is running on port 3000
- `.env` file has correct `REACT_APP_BACKEND_URL`

## Quick Fix Command

Run this in PowerShell:
```powershell
cd C:\Users\vemul\OneDrive\Desktop\Nexathon
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server.js"
Start-Sleep -Seconds 5
Invoke-WebRequest -Uri "http://localhost:5000/api/health-check" -UseBasicParsing
```

## Verification

Once backend is running, you should see:
- ✅ Backend window showing "Server Status: RUNNING"
- ✅ Health check returns status 200
- ✅ Frontend can connect to backend

