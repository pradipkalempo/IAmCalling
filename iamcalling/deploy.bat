@echo off
REM IAMCALLING Windows Deployment Script

echo ========================================
echo IAMCALLING Deployment Script (Windows)
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js version:
node -v
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm version:
npm -v
echo.

REM Install dependencies
echo Installing dependencies...
call npm install --production

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Check .env file
if not exist .env (
    echo [WARNING] .env file not found!
    if exist .env.example (
        echo Creating .env from .env.example...
        copy .env.example .env
        echo.
        echo [IMPORTANT] Please edit .env file with your credentials
        echo Press any key to open .env file...
        pause >nul
        notepad .env
        echo.
        echo After editing .env, run this script again
        pause
        exit /b 0
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
)

echo [OK] .env file exists
echo.

REM Create directories
if not exist logs mkdir logs
if not exist uploads mkdir uploads
echo [OK] Required directories created
echo.

REM Deployment options
echo Choose deployment method:
echo 1. Direct (npm start)
echo 2. PM2 (process manager)
echo.
set /p choice="Enter choice (1-2): "

if "%choice%"=="1" (
    echo.
    echo Starting application with npm...
    npm start
) else if "%choice%"=="2" (
    where pm2 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Installing PM2...
        call npm install -g pm2
    )
    echo Starting application with PM2...
    pm2 start ecosystem.config.js
    pm2 save
    echo.
    echo [OK] Application started with PM2
    echo.
    echo Useful commands:
    echo - View logs: pm2 logs iamcalling
    echo - Restart: pm2 restart iamcalling
    echo - Stop: pm2 stop iamcalling
    echo - Status: pm2 status
    echo.
) else (
    echo Invalid choice
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Complete!
echo Application: http://localhost:1000
echo Health Check: http://localhost:1000/health
echo ========================================
echo.
pause
