# 🚀 Deploy IAMCALLING to Render.com

## Step 1: Prepare Repository

### Push to GitHub
```bash
cd e:\Icu_updated.1
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/iamcalling.git
git push -u origin main
```

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

## Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the `iamcalling` repository

## Step 4: Configure Service

### Basic Settings:
- **Name**: `iamcalling`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `iamcalling`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Advanced Settings:
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes`

## Step 5: Add Environment Variables

Click **"Environment"** tab and add:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_PASSWORD=your-secure-password
CORS_ORIGIN=https://iamcalling.onrender.com
```

### Get Your Credentials:

**Supabase** (Database):
1. Go to https://supabase.com
2. Create project
3. Settings → API → Copy URL and keys

**Cloudinary** (Images):
1. Go to https://cloudinary.com
2. Dashboard → Copy cloud name, API key, secret

**Email** (Gmail):
1. Enable 2FA on Gmail
2. Generate App Password
3. Use that password

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your app will be at: `https://iamcalling.onrender.com`

## Step 7: Verify Deployment

Test these URLs:
- https://iamcalling.onrender.com
- https://iamcalling.onrender.com/health
- https://iamcalling.onrender.com/15-login.html

## Step 8: Custom Domain (Optional)

1. Go to **Settings** → **Custom Domain**
2. Add your domain: `yourdomain.com`
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: iamcalling.onrender.com
   ```
4. Update CORS_ORIGIN environment variable

## Troubleshooting

### Build Fails
- Check Node.js version in package.json
- Verify all dependencies are in package.json
- Check build logs for errors

### App Crashes
- Check logs: Dashboard → Logs
- Verify all environment variables are set
- Test database connection

### 502 Bad Gateway
- Check health endpoint works
- Verify PORT is set to 10000
- Check application logs

## Free Tier Limitations

- App sleeps after 15 min inactivity
- 750 hours/month free
- Slower cold starts
- Upgrade to paid for always-on

## Update Deployment

```bash
git add .
git commit -m "Update"
git push origin main
```

Render auto-deploys on push!

## Monitor Your App

- **Dashboard**: https://dashboard.render.com
- **Logs**: Real-time in dashboard
- **Metrics**: CPU, Memory, Requests

## Support

- Render Docs: https://render.com/docs
- Community: https://community.render.com
- Developer: Pradip Kale - [LinkedIn](https://www.linkedin.com/in/pradip-kale-a116112a0)

---

✅ **Your IAMCALLING platform is now live on Render!**
