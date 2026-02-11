@echo off
echo ========================================
echo Messenger Module E2E Test Runner
echo ========================================
echo.

echo Checking if server is running on port 1000...
curl -s http://localhost:1000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Server is not running on port 1000
    echo Please start the server first:
    echo   npm --prefix iamcalling start
    echo.
    pause
    exit /b 1
)

echo Server is running!
echo.

echo Running Cypress tests...
echo.

npx cypress run --spec "cypress/e2e/messenger-comprehensive.cy.js" --config baseUrl=http://localhost:1000

echo.
echo ========================================
echo Tests completed!
echo ========================================
pause
