# 🚀 Quick Deployment Reference

## One-Line Deploy Commands

### Local Testing
```bash
npm install && npm start
```

### PM2 Deployment
```bash
npm install -g pm2 && pm2 start ecosystem.config.js && pm2 save
```

### Docker Deployment
```bash
docker-compose up -d --build
```

### Heroku Deployment
```bash
heroku create && git push heroku main
```

## Essential URLs

- **Application**: http://localhost:1000
- **Health Check**: http://localhost:1000/health
- **Admin Dashboard**: http://localhost:1000/39-admin-login.html

## Environment Variables (Required)

```env
PORT=1000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_KEY=your-key
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_PASSWORD=your-password
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Change PORT in .env |
| CORS error | Update CORS_ORIGIN |
| DB connection fails | Check Supabase credentials |
| Images not uploading | Verify Cloudinary keys |
| App crashes | Check logs: `pm2 logs` |

## Support

📧 Contact: Pradip Kale  
🔗 LinkedIn: [pradip-kale-a116112a0](https://www.linkedin.com/in/pradip-kale-a116112a0)
