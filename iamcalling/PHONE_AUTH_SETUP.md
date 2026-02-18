# Phone Authentication - Quick Setup Guide

## Step 1: Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add phone column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
COMMENT ON COLUMN users.phone IS 'User phone number for authentication (format: +1234567890)';
```

## Step 2: Verify Changes

All code changes have been applied to:
- ✅ `public/15-login.html` - Phone login UI
- ✅ `public/16-register.html` - Phone registration UI  
- ✅ `public/js/15-login-fixed.js` - Phone login logic
- ✅ `routes/auth.js` - Backend authentication

## Step 3: Test the Feature

### Test Registration:
1. Navigate to: `http://localhost:1000/16-register.html`
2. Click the "Phone" toggle button
3. Enter test data:
   - First Name: Test
   - Last Name: User
   - Phone: +12345678901
   - PIN: 1234
4. Click "Create Account"
5. Should redirect to profile page

### Test Login:
1. Navigate to: `http://localhost:1000/15-login.html`
2. Click the "Phone" toggle button
3. Enter:
   - Phone: +12345678901
   - Password: 1234
4. Click "LOGIN"
5. Should redirect to profile page

## Step 4: Verify Database

Check your Supabase users table:
```sql
SELECT id, first_name, last_name, email, phone, created_at 
FROM users 
WHERE phone IS NOT NULL;
```

## Phone Number Format

Users must enter phone numbers in international format:
- Format: `+[country_code][number]`
- Example: `+12345678901` (USA)
- Example: `+447911123456` (UK)
- Example: `+919876543210` (India)

## Features

✅ Toggle between Email and Phone on both pages
✅ Phone number validation
✅ Unique phone constraint (no duplicates)
✅ Same 4-character PIN system
✅ Profile photo upload support
✅ Remember me functionality
✅ Proper error messages

## Troubleshooting

**Issue: "Column phone does not exist"**
- Solution: Run the migration SQL in Step 1

**Issue: "Invalid phone number"**
- Solution: Ensure format starts with + and country code

**Issue: "Phone already registered"**
- Solution: Phone exists in database, try login instead

## Next Steps (Optional Enhancements)

1. **SMS Verification**: Integrate Twilio for OTP verification
2. **Phone Formatting**: Add auto-formatting for better UX
3. **Country Code Selector**: Dropdown for country codes
4. **Two-Factor Auth**: SMS-based 2FA

## Support

For detailed documentation, see: `docs/PHONE_AUTHENTICATION.md`
