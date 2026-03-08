# Quick Email Setup - Web3Forms (FREE, 2 minutes)

## Why Web3Forms?
- ✅ FREE (250 emails/month)
- ✅ No credit card needed
- ✅ No backend code needed
- ✅ Works immediately
- ✅ 2-minute setup

## Setup Steps:

### 1. Get Free Access Key (30 seconds)
- Go to: https://web3forms.com
- Click "Get Started Free"
- Enter your email: `kalepradip2003@outlook.com`
- Click "Create Access Key"
- **Copy the Access Key** (looks like: `abc123-def456-ghi789`)

### 2. Update Code (30 seconds)
- Open: `public/js/password-reset-simple.js`
- Find line 62: `access_key: 'YOUR_WEB3FORMS_KEY'`
- Replace with: `access_key: 'abc123-def456-ghi789'` (your key)
- Save file

### 3. Update HTML (30 seconds)
- Open: `public/20-password_reset.html`
- Find line with: `<script src="js/password-reset-request.js"></script>`
- Replace with: `<script src="js/password-reset-simple.js"></script>`
- Save file

### 4. Test (30 seconds)
- Refresh page: http://localhost:1000/20-password_reset.html
- Enter email: `bgtsigh7777@gmail.com`
- Click "Send Reset Link"
- **Check email inbox!**

## Done! 🎉

Emails will be sent from Web3Forms to user's email.

## Email Will Look Like:

```
From: IAMCALLING (via Web3Forms)
To: bgtsigh7777@gmail.com
Subject: Password Reset Request - IAMCALLING

Hi User,

Click this link to reset your password:
http://localhost:1000/reset-password.html?token=abc123...

This link expires in 1 hour.

If you didn't request this, ignore this email.

- IAMCALLING Team
```

## No Server Restart Needed!

Just update the access key and HTML file, then refresh browser.

## Alternative: Use Your Outlook

If you want emails from YOUR Outlook instead:
1. Backend route needs to work (currently 404)
2. Server needs restart with new code
3. More complex setup

**Recommendation: Use Web3Forms for now (2 min setup)**
