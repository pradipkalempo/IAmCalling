@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║   IAMCALLING - Complete E2E Testing (Auto Start)          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [Step 1/3] Starting server...
echo.

cd iamcalling
start "IAMCALLING Server" cmd /k "npm start"

echo Waiting for server to start (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [Step 2/3] Running quick verification...
echo.

node quick-e2e-test.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Quick test failed. Server may not be ready.
    echo    Please check the server window and try again.
    cd ..
    pause
    exit /b 1
)

echo.
echo [Step 3/3] Running full E2E tests...
echo.

node run-e2e-tests.js

cd ..
echo.
echo ════════════════════════════════════════════════════════════
echo Testing complete! Check the results above.
echo Server is still running in the other window.
echo ════════════════════════════════════════════════════════════
pause
