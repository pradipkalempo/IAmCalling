# Fix: Password Reset 404 Error

## Error:
```
api/password-reset/request-reset:1 Failed to load resource: 404 (Not Found)
```

## Cause:
Server is running with old code. New password reset route not loaded.

## Solution:

### Step 1: Stop Server
Press `Ctrl + C` in the terminal where server is running

### Step 2: Restart Server
```bash
cd iamcalling
npm start
```

### Step 3: Verify Server Started
You should see:
```
🚀 Server running on http://localhost:1000
```

### Step 4: Test Password Reset
1. Go to: http://localhost:1000/20-password_reset.html
2. Enter email
3. Click "Send Reset Link"
4. Should work now!

## If Still Getting Error:

### Check .env has Gmail App Password:
```env
EMAIL_USER=kalepradip2003@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Check nodemailer installed:
```bash
npm list nodemailer
```
Should show: `nodemailer@6.9.0` or similar

### Check route file exists:
```bash
dir routes\passwordReset.js
```
Should show the file

## Quick Test Without Email:

If you don't have Gmail App Password yet, you can test the database check:

1. Restart server
2. Go to password reset page
3. Enter a non-existent email
4. Should show: "No account found with this email address"
5. Enter a real registered email
6. Will try to send email (will fail without Gmail password, but proves route works)

## Current Status:
✅ Route created: `/api/password-reset/request-reset`
✅ Server.js updated with route
✅ Nodemailer installed
⏳ Server restart needed
⏳ Gmail App Password needed in .env
