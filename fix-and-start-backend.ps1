# Fix and Start Backend Server Script
Write-Host "`n🔧 FIXING AND STARTING BACKEND SERVER`n" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

# Step 1: Stop any existing Node processes
Write-Host "Step 1: Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Cleared existing processes" -ForegroundColor Green
Write-Host ""

# Step 2: Check and install dependencies
Write-Host "Step 2: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Check and create .env file
Write-Host "Step 3: Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "   Creating .env file..." -ForegroundColor Gray
    @"
PORT=5000
GEMINI_API_KEY=your-gemini-api-key-here
JWT_SECRET=neuroshield-secret-key-change-in-production
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Verify server.js exists
Write-Host "Step 4: Verifying server.js..." -ForegroundColor Yellow
if (Test-Path "server.js") {
    Write-Host "✅ server.js found" -ForegroundColor Green
} else {
    Write-Host "❌ server.js NOT FOUND!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Start the server
Write-Host "Step 5: Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🛡️  NEUROSHIELD BACKEND SERVER" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Port: 5000" -ForegroundColor Yellow
Write-Host "URL: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host ""

# Start the server
node server.js

