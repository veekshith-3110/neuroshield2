# Quick JDK Setup Script
# This script automatically sets up the JDK that's already in the project

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$JdkPath = Join-Path $scriptPath "jdk\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64"

Write-Host "`n🔧 Quick JDK Setup for Nexathon Project" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify JDK path exists
if (-not (Test-Path $JdkPath)) {
    Write-Host "❌ Error: JDK not found at: $JdkPath" -ForegroundColor Red
    Write-Host "   Please make sure the JDK is in the jdk folder" -ForegroundColor Yellow
    exit 1
}

# Verify it's a JDK (check for bin folder)
if (-not (Test-Path (Join-Path $JdkPath "bin"))) {
    Write-Host "❌ Error: Invalid JDK path. 'bin' folder not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ JDK found at: $JdkPath" -ForegroundColor Green
Write-Host ""

# Set JAVA_HOME
Write-Host "📝 Setting JAVA_HOME..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("JAVA_HOME", $JdkPath, "User")
$env:JAVA_HOME = $JdkPath
Write-Host "   ✅ JAVA_HOME set to: $JdkPath" -ForegroundColor Green

# Add to PATH
Write-Host "📝 Adding JDK to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$jdkBinPath = Join-Path $JdkPath "bin"

if ($currentPath -notlike "*$jdkBinPath*") {
    $newPath = "$currentPath;$jdkBinPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = "$env:Path;$jdkBinPath"
    Write-Host "   ✅ Added JDK to PATH" -ForegroundColor Green
} else {
    Write-Host "   ✅ JDK already in PATH" -ForegroundColor Green
}

# Verify installation
Write-Host ""
Write-Host "🔍 Verifying installation..." -ForegroundColor Cyan
$javaExe = Join-Path $jdkBinPath "java.exe"
if (Test-Path $javaExe) {
    Write-Host "   ✅ Java executable found" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Java Version:" -ForegroundColor White
    & $javaExe -version
} else {
    Write-Host "   ⚠️  Java executable not found at expected location" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   • JDK is located in: $JdkPath" -ForegroundColor White
Write-Host "   • Cursor/VS Code is already configured via .vscode/settings.json" -ForegroundColor White
Write-Host "   • JAVA_HOME is set for your user account" -ForegroundColor White
Write-Host "   • JDK is added to your PATH" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Please restart your terminal and Cursor for changes to take effect" -ForegroundColor Yellow
Write-Host ""
Write-Host "📦 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Restart Cursor/VS Code" -ForegroundColor White
Write-Host "   2. Install Java extensions in Cursor:" -ForegroundColor White
Write-Host "      - Extension Pack for Java (by Microsoft)" -ForegroundColor Gray
Write-Host "      - Kotlin Language (by fwcd)" -ForegroundColor Gray
Write-Host "   3. Open a Kotlin file (e.g., android/HealthApiService.kt) to test" -ForegroundColor White
Write-Host ""

