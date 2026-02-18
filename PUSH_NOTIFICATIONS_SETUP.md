# Web Push Notifications Setup Guide

## 🚀 What This Does

Enables **native device notifications** that appear on:
- 📱 Phone lock screen (Android/iOS 16.4+)
- 💻 PC notification center (Windows/Mac)
- ⌚ Smartwatch (if connected)

**Works even when browser is CLOSED!**

---

## 📋 Setup Steps

### 1. Install Dependencies

```bash
cd iamcalling
npm install
```

This installs `web-push` package.

---

### 2. Generate VAPID Keys

```bash
node generate-vapid-keys.js
```

Copy the output keys.

---

### 3. Add Keys to .env File

Add these lines to `iamcalling/.env`:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

---

### 4. Create Database Table

Go to **Supabase SQL Editor** and run:

```sql
-- Copy content from migrations/create_push_subscriptions.sql
```

Or directly:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste content from `migrations/create_push_subscriptions.sql`
4. Click "Run"

---

### 5. Restart Server

```bash
npm start
```

---

## ✅ How to Test

### Test 1: Subscribe to Notifications

1. Open your website in browser
2. After 3 seconds, you'll see "Allow Notifications" popup
3. Click "Allow"
4. Browser will ask for permission - click "Allow"
5. ✅ You're subscribed!

### Test 2: Send Notification from Admin

1. Go to admin dashboard: `http://localhost:1000/40-admin-dashboard-simple.html`
2. Click "Send Notification" in sidebar
3. Fill in:
   - Title: "Test Notification"
   - Message: "This is a test!"
   - Icon: 📢
4. Click "Send to All"
5. **Close your browser completely** ❌
6. Wait 2-3 seconds
7. 🎉 Notification appears on your device!

---

## 📱 Platform Support

### ✅ Full Support (Browser Closed Works)
- **Android Chrome** - Perfect
- **Android Firefox** - Perfect
- **Windows Chrome** - Perfect
- **Windows Edge** - Perfect
- **Mac Chrome** - Perfect
- **Mac Safari** - Perfect

### ⚠️ Limited Support
- **iOS Safari** - Only works if site added to home screen (iOS 16.4+)
- **iOS Chrome** - Uses Safari engine, same limitation

---

## 🔧 API Endpoints

### Get VAPID Public Key
```
GET /api/vapid-public-key
```

### Subscribe to Push
```
POST /api/push-subscribe
Body: { subscription, userAgent }
```

### Send Push to All (Admin)
```
POST /api/admin/send-push
Body: { title, message, icon }
```

### Test Push
```
POST /api/test-push
Body: { endpoint }
```

---

## 🗂️ Files Created

```
iamcalling/
├── package.json (updated - added web-push)
├── generate-vapid-keys.js (NEW)
├── routes/
│   └── push-notifications.js (NEW)
├── public/
│   ├── sw.js (NEW - Service Worker)
│   └── js/
│       └── push-notifications.js (UPDATED)
├── migrations/
│   └── create_push_subscriptions.sql (NEW)
└── server.js (UPDATED - added routes)
```

---

## 🎯 How It Works

```
User visits site
    ↓
Clicks "Allow Notifications"
    ↓
Service Worker registers
    ↓
Subscription saved to database
    ↓
User closes browser ❌
    ↓
Admin sends notification
    ↓
Server → Google/Apple Push Service
    ↓
Push Service → User's Device
    ↓
Service Worker wakes up
    ↓
🔔 Notification appears on lock screen!
```

---

## 🐛 Troubleshooting

### Notifications not appearing?

1. **Check browser console** for errors
2. **Verify VAPID keys** in .env
3. **Check database** - is subscription saved?
   ```sql
   SELECT * FROM push_subscriptions;
   ```
4. **Test endpoint**:
   ```bash
   curl -X POST http://localhost:1000/api/admin/send-push \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","message":"Hello!"}'
   ```

### Service Worker not registering?

1. Must use **HTTPS** in production (localhost is OK)
2. Check `/sw.js` is accessible
3. Clear browser cache

### iOS not working?

1. iOS 16.4+ required
2. Must add site to home screen
3. Regular Safari browser won't work

---

## 🔒 Security Notes

- VAPID keys are like passwords - keep private!
- Never commit `.env` to git
- Service Worker only works on HTTPS (except localhost)
- Users can revoke permission anytime

---

## 📊 Database Schema

```sql
push_subscriptions
├── id (bigserial)
├── endpoint (text, unique)
├── p256dh (text)
├── auth (text)
├── user_agent (text)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## 🎉 Success!

Your platform now sends **real push notifications** to users' devices, even when browser is closed!

Admin can send announcements that appear on:
- Phone lock screens 📱
- PC notification centers 💻
- Smartwatches ⌚

Just like WhatsApp, Facebook, Instagram! 🚀
