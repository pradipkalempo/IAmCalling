@echo off
echo ========================================
echo IAMCALLING - Full E2E Testing Suite
echo ========================================
echo.

cd iamcalling

echo [1/2] Running quick verification...
node quick-e2e-test.js

if %errorlevel% neq 0 (
    echo.
    echo Quick test failed. Fix issues before running full tests.
    cd ..
    pause
    exit /b 1
)

echo.
echo [2/2] Running full E2E tests...
node run-e2e-tests.js

cd ..
pause
