# 🚀 How to Run E2E Tests - Simple Instructions

## ⚡ Quick Start (2 Steps)

### Step 1: Start the Server

Open a terminal and run:
```bash
npm start
```

**Wait until you see:**
```
🚀 Server running on http://localhost:1000
```

### Step 2: Run Tests (in a NEW terminal)

Open a **NEW terminal** and run:
```bash
npm run test:quick
```

Then run full tests:
```bash
npm run test:e2e
```

---

## 🎯 Alternative: Auto-Start (Windows)

Double-click this file:
```
run-tests-auto.bat
```

This will:
1. ✅ Start the server automatically
2. ✅ Wait 10 seconds
3. ✅ Run quick tests
4. ✅ Run full E2E tests

---

## 📋 Manual Steps

### Terminal 1 (Server):
```bash
cd E:\Icu_updated.1
npm start
```

### Terminal 2 (Tests):
```bash
cd E:\Icu_updated.1
npm run test:quick      # Quick test (30s)
npm run test:e2e        # Full tests (5-10min)
```

---

## ✅ What You Should See

### Quick Test Output:
```
✅ Server is running
✅ Health endpoint responds
✅ Config endpoint provides Supabase credentials
✅ Page loads: /15-login.html
...
📊 Test Results:
   ✅ Passed: 16
   ❌ Failed: 0
```

### Full E2E Test Output:
```
🚀 Starting Cypress E2E Tests...

Running: comprehensive-platform-test.cy.js
  ✓ Page Loading Tests (9 tests)
  ✓ User Registration (3 tests)
  ✓ Authentication (3 tests)
  ...
  50+ passing
```

---

## 🐛 Troubleshooting

### "Server is not running"
**Solution:** Start the server first in a separate terminal:
```bash
npm start
```

### "Port 1000 already in use"
**Solution:** Kill the existing process:
```bash
netstat -ano | findstr :1000
taskkill /PID <PID> /F
```

### "Cypress not found"
**Solution:** Install dependencies:
```bash
cd iamcalling
npm install
```

---

## 📊 Test Summary

- **Quick Test:** 16 tests in 30 seconds
- **Full E2E:** 50+ tests in 5-10 minutes
- **Coverage:** All platform features

---

## 🎉 That's It!

Just remember:
1. **Start server first** (Terminal 1)
2. **Run tests** (Terminal 2)

Or use: `run-tests-auto.bat` for automatic setup!
