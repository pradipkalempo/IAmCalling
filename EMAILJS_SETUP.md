# EmailJS Setup for Password Reset Emails

## Current Status:
✅ Email detection works (checks Supabase)
✅ Reset token generated and saved
✅ Reset link created
⏳ Email sending needs EmailJS setup

## Option 1: Use EmailJS (Free, Easy)

### Steps:

1. **Sign up at EmailJS**
   - Go to: https://www.emailjs.com/
   - Sign up with your email
   - Verify email

2. **Add Email Service**
   - Dashboard → Email Services → Add New Service
   - Choose "Gmail"
   - Connect your Gmail: `kalepradip2003@gmail.com`
   - Note the **Service ID** (e.g., `service_abc123`)

3. **Create Email Template**
   - Dashboard → Email Templates → Create New Template
   - Template Name: "Password Reset"
   - Template Content:
   ```
   Hi {{to_name}},
   
   Click this link to reset your password:
   {{reset_link}}
   
   This link expires in 1 hour.
   
   If you didn't request this, ignore this email.
   
   - IAMCALLING Team
   ```
   - Note the **Template ID** (e.g., `template_xyz789`)

4. **Get Public Key**
   - Dashboard → Account → API Keys
   - Copy **Public Key** (e.g., `user_abc123xyz`)

5. **Update Code**
   - Open: `public/js/password-reset-request.js`
   - Replace these lines (around line 5-7):
   ```javascript
   const serviceID = 'service_abc123'; // Your Service ID
   const templateID = 'template_xyz789'; // Your Template ID
   const publicKey = 'user_abc123xyz'; // Your Public Key
   ```

6. **Test**
   - Go to: http://localhost:1000/20-password_reset.html
   - Enter email
   - Check inbox for reset email!

## Option 2: Fix Backend (Requires Server Restart)

If you want to use Gmail directly (no EmailJS):

1. **Get Gmail App Password**
   - https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Generate App Password for "Mail"
   - Copy 16-character password

2. **Update .env**
   ```env
   EMAIL_PASS=abcdefghijklmnop
   ```

3. **Restart Server**
   ```bash
   cd iamcalling
   npm start
   ```

4. **Backend route will work**
   - `/api/password-reset/request-reset` will send email

## Current Behavior:

**Without EmailJS setup:**
- ✅ Checks if email exists
- ✅ Generates reset token
- ✅ Saves to database
- ⚠️ Shows link on screen (copy & paste)

**With EmailJS setup:**
- ✅ All above +
- ✅ Sends email to user
- ✅ User clicks link in email
- ✅ Resets password

## Recommendation:

Use **EmailJS** - it's:
- Free (200 emails/month)
- No server restart needed
- Works immediately
- Easy setup (5 minutes)
