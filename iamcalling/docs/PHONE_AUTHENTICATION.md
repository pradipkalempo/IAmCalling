# Phone Authentication Feature

## Overview
Added alternative phone-based registration and login to complement the existing email authentication system.

## Features Added

### 1. Registration Page (16-register.html)
- Toggle between Email and Phone registration
- Phone number input with validation
- Support for international phone numbers (format: +1234567890)
- All existing features maintained (PIN, profile photo, etc.)

### 2. Login Page (15-login.html)
- Toggle between Email and Phone login
- Phone number input with validation
- Same 4-character password system
- Seamless authentication flow

### 3. Backend Updates (routes/auth.js)
- Updated `/api/auth/register` endpoint to accept phone numbers
- Updated `/api/auth/login` endpoint to authenticate via phone
- Duplicate checking for both email and phone
- Proper error messages for each authentication mode

### 4. Database Migration
- Added `phone` column to users table
- Unique constraint on phone numbers
- Index for performance optimization

## Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add phone column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
COMMENT ON COLUMN users.phone IS 'User phone number for authentication (format: +1234567890)';
```

Or run the migration file:
```bash
# Location: supabase_migrations/20260201000000_add_phone_column.sql
```

## Usage

### For Users

#### Registration with Phone:
1. Go to registration page (16-register.html)
2. Click "Phone" toggle button
3. Enter first name, last name, and phone number (format: +1234567890)
4. Create 4-character PIN
5. Optionally upload profile photo
6. Click "Create Account"

#### Login with Phone:
1. Go to login page (15-login.html)
2. Click "Phone" toggle button
3. Enter phone number
4. Enter 4-character password
5. Click "LOGIN"

### Phone Number Format
- Must start with country code (e.g., +1 for USA)
- Format: +[country code][number]
- Example: +12345678901
- No spaces or dashes in the input

## Technical Details

### Frontend Changes

**15-login.html:**
- Added toggle buttons for Email/Phone selection
- Added phone input field (hidden by default)
- Toggle logic to switch between email and phone modes
- Updated validation to check phone format

**16-register.html:**
- Added toggle buttons for Email/Phone selection
- Added phone input field (hidden by default)
- Toggle logic to switch between email and phone modes
- Updated form submission to include phone data

**js/15-login-fixed.js:**
- Added `isValidPhone()` function for phone validation
- Updated login logic to support both email and phone
- Dynamic query building based on login mode

### Backend Changes

**routes/auth.js:**
- `/api/auth/register`:
  - Accepts `phone` parameter
  - Validates either email or phone is provided
  - Checks for duplicate phone numbers
  - Stores phone in database
  
- `/api/auth/login`:
  - Accepts `phone` parameter
  - Queries user by phone if provided
  - Falls back to email if phone not found
  - Returns user data with phone field

### Database Schema

```sql
users table:
- id (uuid, primary key)
- email (varchar, unique, nullable)
- phone (varchar(20), unique, nullable)
- password (varchar, hashed)
- first_name (varchar)
- last_name (varchar)
- profile_photo (text)
- created_at (timestamp)
- ... other fields
```

## Security Considerations

1. **Phone Validation**: Basic format validation on frontend and backend
2. **Unique Constraint**: Prevents duplicate phone registrations
3. **Password Hashing**: Same bcrypt hashing for all authentication methods
4. **JWT Tokens**: Same token-based authentication system

## Future Enhancements

Consider implementing:
1. **SMS OTP Verification**: Use Twilio or AWS SNS for phone verification
2. **Two-Factor Authentication**: SMS-based 2FA
3. **Phone Number Verification**: Verify phone ownership during registration
4. **International Format Support**: Better handling of various phone formats
5. **Rate Limiting**: Prevent SMS spam and brute force attacks

## Testing

### Manual Testing Steps:

1. **Register with Phone:**
   - Navigate to registration page
   - Switch to Phone mode
   - Enter: +12345678901
   - Complete registration
   - Verify user created in database

2. **Login with Phone:**
   - Navigate to login page
   - Switch to Phone mode
   - Enter registered phone number
   - Enter password
   - Verify successful login

3. **Duplicate Prevention:**
   - Try registering with same phone number
   - Should show error message

4. **Toggle Functionality:**
   - Switch between Email and Phone modes
   - Verify correct fields show/hide
   - Verify validation works for each mode

## Troubleshooting

### Common Issues:

1. **"Phone number already registered"**
   - Phone number exists in database
   - Try logging in instead

2. **"Invalid phone number"**
   - Check format: must start with +
   - Include country code
   - No spaces or special characters

3. **Database Error**
   - Ensure migration has been run
   - Check phone column exists in users table
   - Verify unique constraint is applied

## Files Modified

1. `public/15-login.html` - Added phone login UI
2. `public/16-register.html` - Added phone registration UI
3. `public/js/15-login-fixed.js` - Added phone login logic
4. `routes/auth.js` - Updated authentication endpoints
5. `supabase_migrations/20260201000000_add_phone_column.sql` - Database migration

## Dependencies

No new dependencies required. Uses existing:
- Express.js
- Supabase
- bcryptjs
- jsonwebtoken

## Notes

- Phone authentication uses the same 4-character PIN system as email
- Users can register with either email OR phone (not both required)
- Existing email users are not affected
- Phone numbers are stored in E.164 format recommendation
