# Phone OTP Authentication - Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Enable Phone Auth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Phone** provider
4. Choose an SMS provider:
   - **Twilio** (Recommended for production)
   - **MessageBird**
   - **Vonage**
   - **Supabase built-in** (for testing)

### Step 2: Configure SMS Provider

#### Option A: Twilio (Recommended)
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number
3. In Supabase Dashboard → Authentication → Settings:
   - Select "Twilio" as SMS provider
   - Enter your Twilio credentials

#### Option B: Supabase Built-in (Testing Only)
- No configuration needed
- Limited to 3 SMS per hour
- Only for development/testing

### Step 3: Test the Feature

1. Start your server: `npm start`
2. Go to: `http://localhost:1000/16-register.html`
3. Click "Phone OTP" toggle
4. Enter phone number: `+1234567890`
5. Click "Send OTP"
6. Check your phone for OTP
7. Enter OTP and complete registration

---

## 📱 How It Works

### Registration Flow:
```
1. User enters name and phone number
2. Clicks "Send OTP"
3. Supabase sends 6-digit OTP via SMS
4. User enters OTP
5. Clicks "Verify & Register"
6. Account created and logged in
```

### Login Flow:
```
1. User enters phone number
2. Clicks "Send OTP"
3. Supabase sends 6-digit OTP via SMS
4. User enters OTP
5. Clicks "Verify OTP"
6. User logged in
```

---

## 🔧 Configuration

### Environment Variables (Optional)
Add to your `.env` file if using Twilio directly:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Supabase Configuration
In Supabase Dashboard → Authentication → Settings:
- **Enable Phone Sign-ups**: ON
- **Confirm Phone**: ON (OTP verification)
- **Phone OTP Expiry**: 60 seconds (default)
- **Phone OTP Length**: 6 digits (default)

---

## 🧪 Testing

### Test Phone Numbers (Development)
Supabase provides test phone numbers that don't send real SMS:
- Use any phone number in development mode
- OTP will be shown in Supabase logs

### Production Testing
1. Use your real phone number
2. Verify OTP is received
3. Test multiple countries
4. Check rate limiting

---

## 📊 Features

✅ **No Password Required** - OTP-based authentication
✅ **Secure** - 6-digit OTP expires in 60 seconds
✅ **User-Friendly** - Simple phone number entry
✅ **Auto-Advance** - OTP inputs auto-focus
✅ **Mobile Optimized** - Touch-friendly interface
✅ **Rate Limited** - Prevents spam

---

## 🔐 Security

- **OTP Expiry**: 60 seconds
- **Rate Limiting**: 3 attempts per hour (configurable)
- **Phone Verification**: Required before account creation
- **Secure Storage**: Supabase handles all security
- **No Password Storage**: More secure than passwords

---

## 🌍 Supported Countries

Supabase Phone Auth supports 200+ countries:
- USA: +1
- UK: +44
- India: +91
- Canada: +1
- Australia: +61
- And many more...

---

## 💰 Pricing

### Twilio (Recommended)
- **SMS Cost**: ~$0.0075 per SMS (USA)
- **Free Trial**: $15 credit
- **Pay as you go**: No monthly fees

### Supabase Built-in
- **Free Tier**: 3 SMS/hour (testing only)
- **Pro Plan**: Higher limits

---

## 🚨 Troubleshooting

### "Phone provider not enabled"
**Solution**: Enable Phone provider in Supabase Dashboard

### "SMS not received"
**Solution**: 
- Check phone number format (+country_code)
- Verify SMS provider credentials
- Check Supabase logs for errors

### "Invalid OTP"
**Solution**:
- OTP expires in 60 seconds
- Request new OTP
- Check for typos

### "Rate limit exceeded"
**Solution**:
- Wait 1 hour
- Increase rate limit in Supabase settings

---

## 📝 Phone Number Format

**Required Format**: `+[country_code][number]`

**Examples**:
- USA: `+12345678901`
- UK: `+447911123456`
- India: `+919876543210`

**Invalid Formats**:
- ❌ `1234567890` (missing +)
- ❌ `+1 234 567 8901` (spaces)
- ❌ `+1-234-567-8901` (dashes)

---

## 🎯 Next Steps

1. ✅ Enable Phone Auth in Supabase
2. ✅ Configure SMS provider (Twilio recommended)
3. ✅ Test registration with your phone
4. ✅ Test login with OTP
5. ✅ Deploy to production

---

## 📚 Documentation

- **Supabase Phone Auth**: https://supabase.com/docs/guides/auth/phone-login
- **Twilio Setup**: https://www.twilio.com/docs/sms
- **This Implementation**: See code in `15-login.html` and `16-register.html`

---

## ✅ Checklist

- [ ] Supabase Phone Auth enabled
- [ ] SMS provider configured
- [ ] Test phone number works
- [ ] OTP received successfully
- [ ] Registration completes
- [ ] Login works
- [ ] Production ready

---

**Status**: ✅ Code Ready - Configure Supabase to activate!
