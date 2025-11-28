# Test Backend Connection Script
Write-Host "`n🔍 Testing Backend Connection..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:5000/api/health-check"

try {
    Write-Host "📡 Attempting to connect to: $backendUrl" -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $backendUrl -UseBasicParsing -TimeoutSec 5
    
    Write-Host "`n✅✅✅ SUCCESS! Backend is RUNNING! ✅✅✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   URL: http://localhost:5000" -ForegroundColor White
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Server: $($data.server)" -ForegroundColor White
    Write-Host "   Version: $($data.version)" -ForegroundColor White
    Write-Host "   Status: $($data.status)" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Backend is accessible and working!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌❌❌ FAILED! Backend is NOT accessible ❌❌❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting Steps:" -ForegroundColor Cyan
    Write-Host "   1. Check if backend server is running:" -ForegroundColor White
    Write-Host "      - Look for a PowerShell window titled 'Backend Server'" -ForegroundColor Gray
    Write-Host "      - Or run: .\start-backend.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Check if port 5000 is in use:" -ForegroundColor White
    Write-Host "      - Run: netstat -ano | findstr :5000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Check backend console for errors:" -ForegroundColor White
    Write-Host "      - Look for error messages in the backend window" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   4. Restart the backend server:" -ForegroundColor White
    Write-Host "      - Close the backend window" -ForegroundColor Gray
    Write-Host "      - Run: cd backend; node server.js" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

