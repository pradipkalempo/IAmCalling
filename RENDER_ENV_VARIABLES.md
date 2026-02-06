# 🔑 Render Environment Variables - Quick Reference

## Copy-Paste Ready for Render Dashboard

Go to: **Render Dashboard** → **Your Service** → **Environment** → **Add Environment Variable**

---

## ✅ Required Variables (Must Have)

### Supabase (Database)
```
SUPABASE_URL=https://gkckyyyaoqsaouemjnxl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk
SUPABASE_SERVICE_KEY=<YOUR_SERVICE_KEY>
```

### Cloudinary (Image Storage)
```
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>
```

### Email (Notifications)
```
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
ADMIN_EMAIL=admin@iamcalling.com
```

### Admin Access
```
ADMIN_PASSWORD=<your-secure-password>
```

### Server Configuration
```
PORT=10000
NODE_ENV=production
```

---

## 📋 How to Add in Render

### Method 1: One by One
1. Click **"Add Environment Variable"**
2. Enter **Key** (e.g., `SUPABASE_URL`)
3. Enter **Value** (e.g., `https://gkckyyyaoqsaouemjnxl.supabase.co`)
4. Click **"Save"**
5. Repeat for each variable

### Method 2: Bulk Add (Faster)
1. Click **"Add from .env"**
2. Paste all variables in this format:
```
SUPABASE_URL=https://gkckyyyaoqsaouemjnxl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CLOUDINARY_CLOUD_NAME=your_cloud_name
```
3. Click **"Add Variables"**

---

## 🔍 Where to Find Your Values

### Supabase Keys
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_KEY`

### Cloudinary Keys
1. Go to: https://cloudinary.com/console
2. Dashboard shows:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### Email App Password (Gmail)
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to: **App passwords**
4. Generate password for "Mail"
5. Copy 16-character password → `EMAIL_PASS`

---

## ⚠️ Security Notes

### ✅ Safe to Expose (Public)
- `SUPABASE_URL` - Public URL
- `SUPABASE_ANON_KEY` - Public key (has RLS protection)
- `CLOUDINARY_CLOUD_NAME` - Public identifier

### 🔒 Keep Secret (Never Expose)
- `SUPABASE_SERVICE_KEY` - Full database access
- `CLOUDINARY_API_SECRET` - Account access
- `EMAIL_PASS` - Email account access
- `ADMIN_PASSWORD` - Admin panel access

---

## ✅ Verification Checklist

After adding variables in Render:

- [ ] All 11 variables added
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] Clicked "Save Changes"
- [ ] Deployment triggered automatically
- [ ] Check logs for "Server running on port 10000"
- [ ] Visit your site: `https://iamcalling.onrender.com`
- [ ] Posts load successfully

---

## 🚨 Common Mistakes

❌ **Wrong**: `SUPABASE_URL = https://...` (space before =)
✅ **Right**: `SUPABASE_URL=https://...` (no space)

❌ **Wrong**: `SUPABASE_ANON_KEY="eyJhbG..."` (quotes included)
✅ **Right**: `SUPABASE_ANON_KEY=eyJhbG...` (no quotes)

❌ **Wrong**: Variable name `supabase_url` (lowercase)
✅ **Right**: Variable name `SUPABASE_URL` (uppercase)

---

## 📞 Quick Test

After deployment, test with:
```bash
curl https://iamcalling.onrender.com/api/config
```

Should return:
```json
{
  "supabaseUrl": "https://gkckyyyaoqsaouemjnxl.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

**Status**: Ready to deploy ✅
