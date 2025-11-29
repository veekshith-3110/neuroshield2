@echo off
echo ========================================
echo   NEUROSHIELD BACKEND SERVER
echo ========================================
echo.
echo Starting server on port 5000...
echo URL: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
node server.js

pause

