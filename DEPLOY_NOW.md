# ✅ READY TO DEPLOY TO RENDER

Your code is committed and ready! Follow these steps:

## Step 1: Push to GitHub (Manual)

Open Git Bash or Command Prompt and run:

```bash
cd e:\Icu_updated.1
git push -u origin main
```

Enter your GitHub credentials when prompted.

## Step 2: Deploy on Render

1. Go to **https://render.com**
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select repository: **pradipkalempo/IAmCalling**

## Step 3: Configure

**Service Settings:**
- Name: `iamcalling`
- Root Directory: `iamcalling`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

## Step 4: Environment Variables

Add these in Render dashboard:

```
NODE_ENV=production
PORT=10000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

ADMIN_PASSWORD=your-secure-password

CORS_ORIGIN=https://iamcalling.onrender.com
```

### Get Credentials:

**Supabase:**
- https://supabase.com → Project → Settings → API

**Cloudinary:**
- https://cloudinary.com → Dashboard

**Gmail App Password:**
- Google Account → Security → 2-Step Verification → App passwords

## Step 5: Deploy

Click **"Create Web Service"**

Wait 3-5 minutes. Your app will be live at:
**https://iamcalling.onrender.com**

## Verify

Test these URLs:
- https://iamcalling.onrender.com
- https://iamcalling.onrender.com/health
- https://iamcalling.onrender.com/15-login.html

---

## Files Ready:
✅ All deployment files created
✅ Code committed to git
✅ Health check endpoint added
✅ Environment configured

## Next: Just push to GitHub and deploy on Render!

Repository: https://github.com/pradipkalempo/IAmCalling
