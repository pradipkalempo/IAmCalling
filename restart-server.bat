@echo off
echo Stopping any running server on port 1000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1000') do taskkill /F /PID %%a 2>nul

echo.
echo Starting server with new password reset feature...
cd iamcalling
npm start
