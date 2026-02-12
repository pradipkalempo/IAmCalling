# Registration Fix - Deployment Guide

## Problem
User registration was stuck because:
1. Auth routes existed but were not mounted in server.js
2. Missing dependencies: `bcryptjs` and `jsonwebtoken`
3. Frontend was trying direct Supabase insertion instead of using backend API

## Solution Applied

### 1. Updated server.js
- Added import for auth routes
- Mounted `/api/auth` endpoint

### 2. Updated package.json
- Added `bcryptjs: ^2.4.3`
- Added `jsonwebtoken: ^9.0.2`

### 3. Updated 16-register.html
- Changed from direct Supabase insertion to backend API call
- Now uses `/api/auth/register` endpoint
- Better error handling with user feedback

## Deployment Steps

### Step 1: Install New Dependencies
```bash
cd iamcalling
npm install
```

### Step 2: Verify Environment Variables
Ensure your `.env` file has:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret-key-here
PORT=1000
```

### Step 3: Restart Server
```bash
npm start
```

### Step 4: Test Registration
1. Open `http://localhost:1000/16-register.html`
2. Fill in registration form
3. Check console for success messages
4. Verify user is created in Supabase

## API Endpoints Now Available

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/test` - Test endpoint

## Testing Registration

```bash
curl -X POST http://localhost:1000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "1234",
    "profilePhoto": null
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful!",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "fullName": "Test User"
  }
}
```

## Security Notes

1. Passwords are hashed using bcrypt before storage
2. JWT tokens expire after 24 hours
3. Email uniqueness is enforced
4. Rate limiting is applied to all API routes (300 requests per 15 minutes)

## Troubleshooting

### If registration still fails:

1. **Check server logs** for error messages
2. **Verify Supabase connection**:
   ```bash
   curl http://localhost:1000/api/auth/test
   ```
3. **Check database** - ensure `users` table exists with correct schema
4. **Clear browser cache** and localStorage
5. **Check network tab** in browser DevTools for API call status

### Common Errors:

- **"bcryptjs not found"** → Run `npm install`
- **"Cannot POST /api/auth/register"** → Server not restarted
- **"Email already registered"** → User exists, try login instead
- **500 error** → Check server logs and Supabase credentials

## Production Deployment

For production (e.g., Render, Heroku):

1. Set environment variables in hosting platform
2. Ensure `JWT_SECRET` is a strong random string
3. Update `CORS_ORIGIN` to your domain
4. Run `npm install` during build
5. Start with `npm start`

## Files Modified

1. `/iamcalling/server.js` - Added auth routes
2. `/iamcalling/package.json` - Added dependencies
3. `/iamcalling/public/16-register.html` - Updated to use API
