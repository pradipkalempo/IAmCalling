# Cloudinary Profile Photo Setup

## Implementation Complete ✅

Profile photos are now saved to **Cloudinary** (cloud storage) and URLs are stored in Supabase `users` table.

## Setup Steps:

### 1. Install Cloudinary Package
```bash
npm install cloudinary
```

### 2. Get Cloudinary Credentials
1. Go to https://cloudinary.com/
2. Sign up / Login
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Update .env File
Replace these values in `iamcalling/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

### 4. Restart Server
```bash
npm start
```

## How It Works:

### Registration Flow:
1. **User uploads photo** → Registration page (16-register.html)
2. **Photo sent to Cloudinary** → `/api/upload/upload-profile-photo`
3. **Cloudinary returns URL** → Secure cloud URL
4. **User registered** → URL saved to Supabase `users.profile_photo`
5. **Photo displayed** → From Cloudinary everywhere

### Settings Update Flow:
1. **User uploads photo** → Settings page (19-user_settings.html)
2. **Photo sent to server** → `/api/upload/upload-profile-photo`
3. **Server uploads to Cloudinary** → Gets secure URL
4. **URL saved to Supabase** → `users.profile_photo` column
5. **Photo displayed** → From Cloudinary URL everywhere

## Benefits:

✅ **Persistent storage** - Photos never lost on server restart
✅ **Fast CDN delivery** - Cloudinary's global CDN
✅ **Auto optimization** - Images compressed automatically
✅ **Face detection** - Auto-crops to face (400x400)
✅ **Scalable** - No server disk space used

## Files Modified:

- `package.json` - Added cloudinary dependency
- `.env` - Added Cloudinary credentials
- `routes/upload.js` - NEW: Upload endpoint
- `server.js` - Added upload route
- `public/js/profile-photo-upload.js` - NEW: Client upload handler
- `19-user_settings.html` - Integrated upload script

## Database Schema:

Supabase `users` table should have:
```sql
profile_photo TEXT -- Stores Cloudinary URL
```

## Testing:

1. Login to app
2. Go to Settings (19-user_settings.html)
3. Upload profile photo
4. Check Cloudinary dashboard - photo should appear
5. Check Supabase users table - URL should be saved
6. Refresh page - photo should display from Cloudinary

## Old Local Uploads:

The `public/uploads/` folder with 25+ local photos can be deleted after migration.
