# IAMCALLING Deployment Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (database)
- Cloudinary account (image storage)
- Email service (Gmail with app password)

## Deployment Options

### Option 1: Traditional Web Hosting (cPanel/Shared Hosting)

#### Step 1: Prepare Files
```bash
cd iamcalling
npm install --production
```

#### Step 2: Upload Files
Upload these folders/files via FTP:
- `public/` - All frontend files
- `routes/` - API routes
- `services/` - Business logic
- `config/` - Configuration
- `server.js` - Main server file
- `package.json` - Dependencies
- `.env` - Environment variables (create from .env.example)

#### Step 3: Configure Environment
Create `.env` file with:
```env
PORT=1000
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_PASSWORD=your-secure-password
CORS_ORIGIN=https://yourdomain.com
```

#### Step 4: Start Application
```bash
npm start
```

For process management:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### Option 2: Render.com (Recommended)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

#### Step 2: Connect to Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: iamcalling
   - **Root Directory**: iamcalling
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Step 3: Add Environment Variables
In Render dashboard, add all variables from `.env.example`

#### Step 4: Deploy
Click "Create Web Service" - Render will auto-deploy

---

### Option 3: Heroku

#### Step 1: Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### Step 2: Create Heroku App
```bash
cd iamcalling
heroku create iamcalling-app
```

#### Step 3: Set Environment Variables
```bash
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_ANON_KEY=your-key
heroku config:set CLOUDINARY_CLOUD_NAME=your-name
# ... add all other env variables
```

#### Step 4: Deploy
```bash
git push heroku main
heroku open
```

---

### Option 4: VPS (DigitalOcean, AWS EC2, Linode)

#### Step 1: SSH into Server
```bash
ssh root@your-server-ip
```

#### Step 2: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: Clone & Setup
```bash
git clone your-repo-url
cd iamcalling
npm install --production
```

#### Step 4: Configure Environment
```bash
nano .env
# Add all environment variables
```

#### Step 5: Setup Nginx (Reverse Proxy)
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/iamcalling
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:1000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/iamcalling /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Start with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 7: SSL Certificate (Optional but Recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify user registration/login works
- [ ] Check article creation and viewing
- [ ] Test image uploads (Cloudinary)
- [ ] Verify messenger functionality
- [ ] Test admin dashboard access
- [ ] Check mobile responsiveness
- [ ] Monitor server logs for errors
- [ ] Setup database backups (Supabase)
- [ ] Configure domain DNS settings
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring (UptimeRobot, etc.)

---

## Troubleshooting

### Port Issues
If port 1000 is blocked, change in `.env`:
```env
PORT=3000
```

### CORS Errors
Update CORS_ORIGIN in `.env`:
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Database Connection
Verify Supabase credentials and check firewall rules

### Image Upload Fails
Verify Cloudinary credentials and check API limits

---

## Monitoring & Maintenance

### View Logs (PM2)
```bash
pm2 logs iamcalling
```

### Restart Application
```bash
pm2 restart iamcalling
```

### Update Application
```bash
git pull origin main
npm install
pm2 restart iamcalling
```

---

## Support

For issues, contact: **Pradip Kale**
- LinkedIn: [pradip-kale-a116112a0](https://www.linkedin.com/in/pradip-kale-a116112a0)
