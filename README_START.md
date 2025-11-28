# 🚀 How to Start the Application

## Quick Start (Recommended)

**Just run this one command:**
```powershell
.\start-servers.ps1
```

This will:
- ✅ Stop any existing servers
- ✅ Start Backend on port 5000
- ✅ Start Frontend on port 3000
- ✅ Open browser automatically

## Manual Start

### Option 1: Two Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Option 2: Using npm start (Frontend Only)

**Important:** `npm start` in the root directory starts the **React frontend only**.

The backend must be started separately:
```bash
cd backend
node server.js
```

## ⚠️ Common Issues

### Error: "Port 5000 already in use"
**Solution:**
```powershell
Get-Process -Name node | Stop-Process -Force
```
Then restart the servers.

### Error: "Network error" when logging in
**Check:**
1. Backend is running: Visit `http://localhost:5000/api/health-check`
2. Backend URL is correct: Check `.env` file has `REACT_APP_BACKEND_URL=http://localhost:5000`
3. CORS is enabled: Backend should have `app.use(cors());`

### Frontend not connecting to backend
**Solution:**
1. Make sure backend is running first
2. Check `.env` file exists with `REACT_APP_BACKEND_URL=http://localhost:5000`
3. Restart frontend after creating/updating `.env`

## 📝 URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health-check

## ✅ Verification

After starting, verify both are running:

```powershell
# Check backend
Invoke-WebRequest http://localhost:5000/api/health-check

# Check frontend (wait 10-20 seconds after npm start)
Invoke-WebRequest http://localhost:3000
```

