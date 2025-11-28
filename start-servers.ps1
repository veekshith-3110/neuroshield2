# Start both Frontend and Backend servers
Write-Host "🚀 Starting Neuroshield Application..." -ForegroundColor Green

# Kill any existing Node processes
Write-Host "`n🛑 Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "`n📡 Starting Backend Server (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 9999); cd '$PSScriptRoot\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; node server.js" -WindowStyle Minimized

# Wait for backend to start
Start-Sleep -Seconds 3

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health-check" -Method GET -UseBasicParsing -TimeoutSec 2
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Backend may still be starting..." -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "`n🌐 Starting Frontend Server (port 3000)..." -ForegroundColor Cyan
Write-Host "   This will open your browser automatically in a few seconds..." -ForegroundColor Gray

# Ensure port 3000 is free
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   Freeing up port 3000..." -ForegroundColor Yellow
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "$host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 9999); cd '$PSScriptRoot'; $env:PORT=3000; Write-Host 'Frontend Server Starting on Port 3000...' -ForegroundColor Green; npm start" -WindowStyle Normal

Write-Host "`n✅ Both servers are starting!" -ForegroundColor Green
Write-Host "`n📝 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "📝 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "`n💡 Wait 10-20 seconds for the frontend to compile and open in your browser." -ForegroundColor Yellow

