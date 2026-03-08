# Environment Files Cleanup

## ✅ Consolidated to ONE .env file

**Location**: `iamcalling/.env`

## Removed Duplicate Files:

❌ `IAmCalling.env` (root level - duplicate)
❌ `iamcalling/public/.env` (wrong location - security risk)
❌ `iamcalling/server/.env` (duplicate)

## Kept Files:

✅ `iamcalling/.env` - **MAIN CONFIG** (all credentials here)
✅ `iamcalling/.env.example` - Template for developers
✅ `iamcalling/.env.render` - Template for Render deployment
✅ `iamcalling/server/.env.example` - Template (can be deleted if not needed)

## Main .env Contents:

```env
NODE_ENV=development
PORT=1000
JWT_SECRET=your-jwt-secret

# Supabase
SUPABASE_URL=https://gkckyyyaoqsaouemjnxl.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# Cloudinary
CLOUDINARY_CLOUD_NAME=dkvrhjvcj
CLOUDINARY_API_KEY=986333671823765
CLOUDINARY_API_SECRET=WnsfgIxj8L5O-lU-BvCtKeac_C8

# Email
EMAIL_USER=kalepradip2003@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=kalepradip2003@gmail.com

# Admin
ADMIN_PASSWORD=PRA03

# Database
DB_PATH=./contact_system.db
```

## Why Only ONE .env?

1. **Security** - Single source of truth
2. **Maintenance** - Update once, not 7 times
3. **No conflicts** - No confusion about which file is used
4. **Best practice** - Standard Node.js convention

## Server Loads From:

`iamcalling/.env` ← Only this file is read by `dotenv.config()`

## Important:

⚠️ Never commit `.env` to Git (already in .gitignore)
⚠️ Use `.env.example` for sharing template with team
⚠️ Use `.env.render` for deployment instructions
