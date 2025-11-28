# JDK Installation Verification Script

Write-Host "`n🔍 Verifying JDK Installation...`n" -ForegroundColor Cyan

# Check if JDK folder exists
$jdkPath = "$PSScriptRoot\jdk\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64"
if (Test-Path $jdkPath) {
    Write-Host "✅ JDK files found at: $jdkPath" -ForegroundColor Green
} else {
    Write-Host "❌ JDK files NOT found at: $jdkPath" -ForegroundColor Red
    exit 1
}

# Check JAVA_HOME
$javaHome = [Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
if ($javaHome) {
    Write-Host "✅ JAVA_HOME is set: $javaHome" -ForegroundColor Green
} else {
    Write-Host "❌ JAVA_HOME is NOT set" -ForegroundColor Red
    Write-Host "   Run: .\setup-jdk-quick.ps1 to install" -ForegroundColor Yellow
}

# Check if Java is in PATH
try {
    $null = Get-Command java -ErrorAction Stop
    Write-Host "✅ Java is accessible via PATH" -ForegroundColor Green
    java -version
} catch {
    Write-Host "❌ Java is NOT in PATH" -ForegroundColor Red
    Write-Host "   Run: .\setup-jdk-quick.ps1 to install" -ForegroundColor Yellow
}

# Test Java directly
$javaExe = "$jdkPath\bin\java.exe"
if (Test-Path $javaExe) {
    Write-Host "`n✅ Java executable verified:" -ForegroundColor Green
    & $javaExe -version
} else {
    Write-Host "`n❌ Java executable NOT found" -ForegroundColor Red
}

Write-Host ""

