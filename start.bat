@echo off
title CampusSpend - Student Expense Tracker
cd /d "%~dp0"

echo ======================================================
echo    Starting CampusSpend (Student Expense Tracker)
echo ======================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Ensure client build exists
if not exist "client\dist\index.html" (
    echo [INFO] Building frontend for the first time...
    call npm run build
)

:: Open browser automatically after a short delay in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

:: Start the server
echo Starting server on http://localhost:5000...
echo (Press Ctrl+C to stop the server)
echo.
node server\index.js

pause
