# JDK Setup Script for Windows
# Run this script in PowerShell (as Administrator for system-wide setup)
# If no path is provided, it will use the JDK in the project's jdk folder

param(
    [Parameter(Mandatory=$false)]
    [string]$JdkPath
)

# If no path provided, use the local JDK in the project
if (-not $JdkPath) {
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    $JdkPath = Join-Path $scriptPath "jdk\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64"
    Write-Host "📦 Using local JDK from project: $JdkPath" -ForegroundColor Cyan
}

Write-Host "🔧 Setting up JDK at: $JdkPath" -ForegroundColor Cyan

# Verify JDK path exists
if (-not (Test-Path $JdkPath)) {
    Write-Host "❌ Error: JDK path does not exist: $JdkPath" -ForegroundColor Red
    exit 1
}

# Verify it's a JDK (check for bin folder)
if (-not (Test-Path (Join-Path $JdkPath "bin"))) {
    Write-Host "❌ Error: Invalid JDK path. 'bin' folder not found." -ForegroundColor Red
    exit 1
}

# Set JAVA_HOME
Write-Host "📝 Setting JAVA_HOME..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("JAVA_HOME", $JdkPath, "User")
$env:JAVA_HOME = $JdkPath
Write-Host "✅ JAVA_HOME set to: $JdkPath" -ForegroundColor Green

# Add to PATH
Write-Host "📝 Adding JDK to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$jdkBinPath = Join-Path $JdkPath "bin"

if ($currentPath -notlike "*$jdkBinPath*") {
    $newPath = "$currentPath;$jdkBinPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = "$env:Path;$jdkBinPath"
    Write-Host "✅ Added JDK to PATH" -ForegroundColor Green
} else {
    Write-Host "✅ JDK already in PATH" -ForegroundColor Green
}

# Verify installation
Write-Host "`n🔍 Verifying installation..." -ForegroundColor Cyan
$javaExe = Join-Path $jdkBinPath "java.exe"
if (Test-Path $javaExe) {
    Write-Host "✅ Java executable found" -ForegroundColor Green
    & $javaExe -version
} else {
    Write-Host "⚠️  Java executable not found at expected location" -ForegroundColor Yellow
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Please restart your terminal and Cursor/VS Code for changes to take effect" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update .vscode/settings.json with your JDK path: $JdkPath" -ForegroundColor White
Write-Host "2. Restart Cursor/VS Code" -ForegroundColor White
Write-Host "3. Install Java extensions in Cursor/VS Code" -ForegroundColor White

