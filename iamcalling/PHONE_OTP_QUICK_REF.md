# 📱 Phone OTP Authentication - Quick Reference

## 🚀 3-Step Setup

### 1. Enable in Supabase
```
Dashboard → Authentication → Providers → Enable "Phone"
```

### 2. Configure SMS
```
Choose: Twilio (production) or Built-in (testing)
Add credentials in Supabase settings
```

### 3. Test
```
npm start
Visit: http://localhost:1000/16-register.html
Click "Phone OTP" → Enter phone → Send OTP → Verify
```

---

## 📱 Phone Format

**Required**: `+[country_code][number]`

**Examples**:
- USA: `+12345678901`
- UK: `+447911123456`
- India: `+919876543210`

---

## 🔄 User Flow

### Registration:
```
1. Click "Phone OTP"
2. Enter name + phone
3. Click "Send OTP"
4. Enter 6-digit OTP
5. Click "Verify & Register"
6. Done! ✅
```

### Login:
```
1. Click "Phone OTP"
2. Enter phone
3. Click "Send OTP"
4. Enter 6-digit OTP
5. Click "Verify OTP"
6. Done! ✅
```

---

## 🎨 UI States

### State 1: Phone Entry
```
[Phone Number Input]
[SEND OTP Button]
```

### State 2: OTP Entry
```
[6 OTP Input Boxes]
[VERIFY OTP Button]
```

---

## 🔧 Key Functions

### Send OTP (Login):
```javascript
await supabase.auth.signInWithOtp({
  phone: '+1234567890'
});
```

### Verify OTP:
```javascript
await supabase.auth.verifyOtp({
  phone: '+1234567890',
  token: '123456',
  type: 'sms'
});
```

---

## 💰 Costs

**Twilio**: ~$0.0075 per SMS
**Supabase**: 3 SMS/hour (testing only)

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Phone provider not enabled" | Enable in Supabase Dashboard |
| "SMS not received" | Check phone format & SMS config |
| "Invalid OTP" | OTP expires in 60s, request new |
| "Rate limit exceeded" | Wait 1 hour or increase limit |

---

## ✅ Features

✅ No password needed
✅ 6-digit OTP
✅ 60-second expiry
✅ Auto-advance inputs
✅ Mobile responsive
✅ Rate limited

---

## 📊 Files Changed

- `15-login.html` - OTP login UI
- `16-register.html` - OTP registration UI

---

## 🔐 Security

- OTP expires: 60 seconds
- Rate limit: 3/hour
- Phone verified
- No password storage
- Supabase secured

---

## 🧪 Testing

**Development**:
```
Use Supabase built-in (free, 3/hour)
```

**Production**:
```
Use Twilio (paid, unlimited)
```

---

## 📚 Docs

- Setup: `PHONE_OTP_SETUP.md`
- Complete: `PHONE_OTP_COMPLETE.md`
- Supabase: https://supabase.com/docs/guides/auth/phone-login

---

## ⚡ Quick Commands

**Start Server**:
```bash
npm start
```

**Test Registration**:
```
http://localhost:1000/16-register.html
```

**Test Login**:
```
http://localhost:1000/15-login.html
```

---

## 🎯 Status

**Code**: ✅ Ready
**Config**: ⚠️ Required
**Action**: Enable Phone Auth in Supabase

---

**Version**: 2.0.0 (OTP)
**Type**: SMS-based authentication
**Status**: Production Ready
