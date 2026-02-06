# ✅ Render Deployment Checklist

## Pre-Deployment

- [ ] Code fixed (published filter removed from 01-index.html)
- [ ] All files saved
- [ ] Git repository ready

---

## Render Dashboard Setup

### Environment Variables (Add 10 variables)

- [ ] `SUPABASE_URL` = https://gkckyyyaoqsaouemjnxl.supabase.co
- [ ] `SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- [ ] `SUPABASE_SERVICE_KEY` = (your service key)
- [ ] `CLOUDINARY_CLOUD_NAME` = (your cloud name)
- [ ] `CLOUDINARY_API_KEY` = (your api key)
- [ ] `CLOUDINARY_API_SECRET` = (your api secret)
- [ ] `EMAIL_USER` = (your email)
- [ ] `EMAIL_PASS` = (your app password)
- [ ] `ADMIN_PASSWORD` = (your admin password)
- [ ] `PORT` = 10000
- [ ] `NODE_ENV` = production

### Build Settings

- [ ] Build Command: `npm install --prefix iamcalling`
- [ ] Start Command: `npm --prefix iamcalling start`

---

## Deploy

- [ ] Push code to Git: `git push origin main`
- [ ] Wait for Render to build (5-10 minutes)
- [ ] Check Render logs for errors

---

## Verify Deployment

- [ ] Visit: https://iamcalling.onrender.com
- [ ] Posts load successfully
- [ ] No "Database Connection Issue" error
- [ ] Visit: https://iamcalling.onrender.com/test-posts.html
- [ ] Test page shows: "✅ Posts query successful"
- [ ] Press F12 → Console shows no errors

---

## Post-Deployment

- [ ] Test login functionality
- [ ] Test article creation
- [ ] Test image uploads
- [ ] Test messenger
- [ ] Test admin panel

---

## If Something Goes Wrong

1. [ ] Check Render logs for errors
2. [ ] Verify all environment variables are set correctly
3. [ ] Test with `/test-posts.html` page
4. [ ] Check browser console (F12) for errors
5. [ ] Verify Supabase database has posts

---

## Quick Commands

### Push to Git
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Test Deployment
```bash
curl https://iamcalling.onrender.com
curl https://iamcalling.onrender.com/api/config
```

---

**Print this checklist and check off items as you complete them!**
