# 🚀 IAMCALLING Deployment Checklist

## Pre-Deployment

### 1. Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Add Supabase credentials (URL, ANON_KEY, SERVICE_KEY)
- [ ] Add Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET)
- [ ] Add email credentials (EMAIL_USER, EMAIL_PASS)
- [ ] Set strong ADMIN_PASSWORD
- [ ] Configure CORS_ORIGIN with your domain
- [ ] Set NODE_ENV=production

### 2. Database Setup (Supabase)
- [ ] Create Supabase project
- [ ] Run all SQL migrations in `supabase_migrations/` folder
- [ ] Verify all tables are created
- [ ] Test database connection
- [ ] Enable Row Level Security (RLS) policies
- [ ] Create database backups schedule

### 3. Storage Setup (Cloudinary)
- [ ] Create Cloudinary account
- [ ] Note down cloud name, API key, and secret
- [ ] Configure upload presets
- [ ] Set up folder structure
- [ ] Test image upload

### 4. Code Preparation
- [ ] Run `npm install` to verify dependencies
- [ ] Test application locally: `npm start`
- [ ] Check all pages load correctly
- [ ] Test user registration/login
- [ ] Test article creation
- [ ] Test messenger functionality
- [ ] Fix any console errors

### 5. Security
- [ ] Remove all test/debug files
- [ ] Ensure no hardcoded credentials
- [ ] Verify .gitignore includes .env
- [ ] Enable HTTPS/SSL
- [ ] Set secure session cookies
- [ ] Configure rate limiting
- [ ] Add security headers (helmet.js)

## Deployment Steps

### Choose Your Hosting Platform:

#### Option A: Render.com (Easiest)
- [ ] Push code to GitHub
- [ ] Connect GitHub to Render
- [ ] Create new Web Service
- [ ] Set root directory to `iamcalling`
- [ ] Add all environment variables
- [ ] Deploy

#### Option B: Heroku
- [ ] Install Heroku CLI
- [ ] Run `heroku create`
- [ ] Set all config vars: `heroku config:set KEY=value`
- [ ] Deploy: `git push heroku main`

#### Option C: VPS (DigitalOcean/AWS/Linode)
- [ ] SSH into server
- [ ] Install Node.js 18+
- [ ] Clone repository
- [ ] Run `npm install --production`
- [ ] Create `.env` file
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start app: `pm2 start ecosystem.config.js`
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL with Let's Encrypt
- [ ] Configure firewall

#### Option D: Shared Hosting (cPanel)
- [ ] Upload files via FTP
- [ ] Install Node.js via cPanel
- [ ] Run `npm install`
- [ ] Configure `.htaccess`
- [ ] Start application
- [ ] Setup cron job for auto-restart

## Post-Deployment

### 1. Verification
- [ ] Visit your domain
- [ ] Test homepage loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Create test article
- [ ] Upload test image
- [ ] Test messenger
- [ ] Test admin dashboard
- [ ] Check mobile responsiveness
- [ ] Test all navigation links

### 2. DNS Configuration
- [ ] Point domain A record to server IP
- [ ] Add www CNAME record
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify domain resolves correctly

### 3. SSL/HTTPS Setup
- [ ] Install SSL certificate (Let's Encrypt recommended)
- [ ] Force HTTPS redirect
- [ ] Update CORS_ORIGIN to use https://
- [ ] Test secure connection

### 4. Monitoring Setup
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error logging
- [ ] Setup email alerts for downtime
- [ ] Monitor server resources (CPU, RAM, disk)
- [ ] Check application logs regularly

### 5. Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure browser caching
- [ ] Optimize images
- [ ] Minify CSS/JS (if needed)
- [ ] Setup CDN (optional)

### 6. Backup Strategy
- [ ] Setup automated database backups
- [ ] Backup uploaded files
- [ ] Store backups off-site
- [ ] Test backup restoration

### 7. Documentation
- [ ] Document deployment process
- [ ] Note all credentials securely
- [ ] Create runbook for common issues
- [ ] Document update procedure

## Maintenance

### Daily
- [ ] Check application is running
- [ ] Monitor error logs
- [ ] Check uptime status

### Weekly
- [ ] Review server resources
- [ ] Check for security updates
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Security audit

## Rollback Plan

If deployment fails:
1. Keep previous version accessible
2. Document the issue
3. Revert to previous version
4. Fix issue locally
5. Test thoroughly
6. Redeploy

## Support Contacts

- **Developer**: Pradip Kale
- **LinkedIn**: [pradip-kale-a116112a0](https://www.linkedin.com/in/pradip-kale-a116112a0)
- **Supabase Support**: https://supabase.com/support
- **Cloudinary Support**: https://support.cloudinary.com

## Quick Commands

```bash
# Start application
npm start

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs iamcalling

# Restart application
pm2 restart iamcalling

# Stop application
pm2 stop iamcalling

# Update application
git pull origin main
npm install
pm2 restart iamcalling

# Check application status
pm2 status

# View health check
curl http://localhost:1000/health
```

---

✅ **Deployment Complete!** Your IAMCALLING platform is now live!
