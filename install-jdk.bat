@echo off
echo ========================================
echo JDK Installation for Nexathon Project
echo ========================================
echo.

set "JDK_PATH=%~dp0jdk\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64"
set "JDK_BIN=%JDK_PATH%\bin"

echo Checking JDK files...
if exist "%JDK_PATH%\bin\java.exe" (
    echo [OK] JDK files found
) else (
    echo [ERROR] JDK files not found at %JDK_PATH%
    pause
    exit /b 1
)

echo.
echo Setting JAVA_HOME...
setx JAVA_HOME "%JDK_PATH%"
if %ERRORLEVEL% EQU 0 (
    echo [OK] JAVA_HOME set
) else (
    echo [WARNING] Failed to set JAVA_HOME
)

echo.
echo Adding JDK to PATH...
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "CURRENT_PATH=%%b"
echo %CURRENT_PATH% | findstr /C:"%JDK_BIN%" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] JDK already in PATH
) else (
    setx Path "%CURRENT_PATH%;%JDK_BIN%"
    if %ERRORLEVEL% EQU 0 (
        echo [OK] JDK added to PATH
    ) else (
        echo [WARNING] Failed to add JDK to PATH
    )
)

echo.
echo Verifying installation...
"%JDK_BIN%\java.exe" -version
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] JDK Installation Complete!
    echo ========================================
    echo.
    echo IMPORTANT: Please restart your terminal and Cursor
    echo for the changes to take effect.
    echo.
) else (
    echo [ERROR] Java verification failed
)

pause

