# Gmail App Password Setup for Password Reset

## ✅ Database Setup - DONE
Columns added to Supabase `users` table:
- `reset_token` (TEXT)
- `reset_token_expiry` (TIMESTAMPTZ)

## ✅ Packages Installed - DONE
- nodemailer installed

## 🔧 Gmail App Password Setup - REQUIRED

### Steps to Get Gmail App Password:

1. **Go to Google Account**
   - Visit: https://myaccount.google.com/
   - Login with: `kalepradip2003@gmail.com`

2. **Enable 2-Step Verification** (if not already enabled)
   - Go to: Security → 2-Step Verification
   - Click "Get Started"
   - Follow the steps to enable

3. **Generate App Password**
   - Go to: Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Click "App passwords"
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "IAMCALLING Password Reset"
   - Click "Generate"

4. **Copy the 16-character password**
   - Example: `abcd efgh ijkl mnop`

5. **Update .env file**
   - Open: `iamcalling/.env`
   - Find: `EMAIL_PASS=your-gmail-app-password`
   - Replace with: `EMAIL_PASS=abcdefghijklmnop` (remove spaces)

6. **Restart Server**
   ```bash
   npm start
   ```

## 🧪 Testing Password Reset:

1. Go to: http://localhost:1000/20-password_reset.html
2. Enter a registered email
3. Click "Send Reset Link"
4. Check email inbox
5. Click reset link in email
6. Enter new 4-character PIN
7. Login with new password

## 📧 Email Template Preview:

**Subject:** Password Reset Request - IAMCALLING

**Body:**
```
Hi [Name],

We received a request to reset your password for your IAMCALLING account.

Click the button below to reset your password:

[Reset Password Button]

Or copy this link: http://localhost:1000/reset-password.html?token=xxx

This link will expire in 1 hour.
If you didn't request this, please ignore this email.
```

## ⚠️ Important Notes:

- App Password is different from your regular Gmail password
- Never share your App Password
- App Password format: 16 characters (no spaces in .env)
- Email will be sent FROM: kalepradip2003@gmail.com
- Email will be sent TO: User's registered email

## 🔒 Security Features:

✅ Token expires in 1 hour
✅ Token is random 32-byte hex string
✅ Token cleared after password reset
✅ Email verification before sending
✅ Database check for account existence

## Current Status:

✅ Database columns added
✅ Backend API created
✅ Frontend pages created
✅ Nodemailer installed
⏳ Gmail App Password needed (add to .env)
⏳ Server restart needed after adding password
