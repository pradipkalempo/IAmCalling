# 🔧 Render Deployment Troubleshooting

## Issue: "Unable to Load Posts" - HTTP 502 Error

### Quick Fixes:

#### 1. Check Environment Variables
Go to Render Dashboard → Your Service → Environment

**Required variables:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Check Render Logs
Dashboard → Logs → Look for errors

Common errors:
- `SUPABASE_URL is not defined` → Add env variable
- `Connection refused` → Check Supabase URL
- `Invalid API key` → Verify Supabase keys

#### 3. Verify Supabase Connection
1. Go to https://supabase.com
2. Project Settings → API
3. Copy exact URL and keys
4. Paste in Render environment variables
5. Click **"Save Changes"**
6. **Manual Deploy** → Deploy latest commit

#### 4. Check Supabase Tables
Run in Supabase SQL Editor:
```sql
-- Check if posts table exists
SELECT * FROM posts LIMIT 1;

-- If not, create it
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  user_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. Enable RLS (Row Level Security)
```sql
-- Allow public read access
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON posts
  FOR SELECT USING (true);
```

#### 6. Redeploy
After fixing:
```bash
git add .
git commit -m "Fix posts API"
git push origin main
```

Render auto-deploys in 2-3 minutes.

---

## Other Common Issues

### App Shows "Application Error"
- Check logs for crash reason
- Verify all dependencies in package.json
- Check Node.js version compatibility

### CORS Errors
Update CORS_ORIGIN:
```
CORS_ORIGIN=https://iamcalling.onrender.com
```

### Images Not Loading
Verify Cloudinary credentials:
```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Login Not Working
Check email configuration:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Test Endpoints

After deployment, test:
- https://iamcalling.onrender.com/health
- https://iamcalling.onrender.com/api/posts
- https://iamcalling.onrender.com/config.js

---

## Need Help?

1. Check Render logs first
2. Verify all environment variables
3. Test Supabase connection
4. Contact: Pradip Kale - [LinkedIn](https://www.linkedin.com/in/pradip-kale-a116112a0)
