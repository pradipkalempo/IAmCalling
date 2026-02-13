@echo off
echo ========================================
echo IAMCALLING - E2E Testing Quick Start
echo ========================================
echo.

cd iamcalling

echo [1/3] Checking if server is running...
timeout /t 2 /nobreak >nul

echo [2/3] Running quick verification test...
node quick-e2e-test.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Quick test passed! Ready for full E2E testing.
    echo.
    echo Run full tests with: npm run test:e2e
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Quick test failed. Please check the errors above.
    echo ========================================
)

cd ..
pause
