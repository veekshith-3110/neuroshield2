# Start Both Frontend and Backend Servers

Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Starting NeuroShield Application" -ForegroundColor Green
Write-Host "════════════════════════════════════════`n" -ForegroundColor Cyan

# Stop any existing Node processes
Write-Host "Step 1: Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "✅ Cleaned up`n" -ForegroundColor Green

# Check if backend .env exists
Write-Host "Step 2: Checking backend configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    "PORT=5000" | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "✅ Created backend .env`n" -ForegroundColor Green
} else {
    Write-Host "✅ Backend .env exists`n" -ForegroundColor Green
}

# Check if frontend .env exists
if (-not (Test-Path ".env")) {
    "REACT_APP_BACKEND_URL=http://localhost:5000`nREACT_APP_GOOGLE_CLIENT_ID=314956634142-hd0uomrgp5s8nor3vdj8a6arqjae8bno.apps.googleusercontent.com" | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Created frontend .env`n" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env exists`n" -ForegroundColor Green
}

# Start backend in new window
Write-Host "Step 3: Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '`n🚀 BACKEND SERVER`n' -ForegroundColor Cyan; Write-Host 'Port: 5000' -ForegroundColor Yellow; Write-Host 'URL: http://localhost:5000`n' -ForegroundColor Yellow; node server.js" -WindowStyle Normal
Write-Host "✅ Backend starting in new window`n" -ForegroundColor Green

# Wait for backend to start
Write-Host "Step 4: Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify backend is running
$backendReady = $false
for ($i = 0; $i -lt 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Backend is RUNNING! (Status: $($response.StatusCode))`n" -ForegroundColor Green
        $backendReady = $true
        break
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "⚠️  Backend may still be starting. Check the backend window.`n" -ForegroundColor Yellow
}

# Start frontend
Write-Host "Step 5: Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "✅ Frontend will open in your browser`n" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000`n" -ForegroundColor White

npm start

