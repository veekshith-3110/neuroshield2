# Start Backend Server
Write-Host "`n🚀 Starting Backend Server...`n" -ForegroundColor Cyan

cd backend

# Check if .env exists
if (-not (Test-Path ".env")) {
    "PORT=5000" | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Created backend .env file" -ForegroundColor Green
}

# Start backend server
Write-Host "📍 Backend will run on: http://localhost:5000`n" -ForegroundColor Yellow
node server.js
