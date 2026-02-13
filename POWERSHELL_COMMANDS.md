# 🚀 E2E Testing - PowerShell Commands

## ✅ CORRECT Commands for PowerShell

### Option 1: Use NPM Scripts (Easiest) ⭐

```powershell
# Terminal 1 - Start Server
npm start

# Terminal 2 - Run Tests (after server starts)
npm run test:quick      # Quick test (30s)
npm run test:e2e        # Full tests (5-10min)
```

### Option 2: Use Batch Files (PowerShell Syntax)

```powershell
# In PowerShell, use .\ before batch files:
.\run-quick-test.bat
.\run-full-tests.bat
.\run-tests-auto.bat    # Auto-start everything
```

### Option 3: Direct Node Commands

```powershell
# Terminal 1 - Start Server
npm start

# Terminal 2 - Run Tests
cd iamcalling
node quick-e2e-test.js
node run-e2e-tests.js
```

---

## 🎯 Recommended: Use NPM Scripts

**This is the easiest and works in all terminals:**

### Step 1: Start Server (Terminal 1)
```powershell
npm start
```

### Step 2: Run Tests (Terminal 2)
```powershell
npm run test:quick
npm run test:e2e
```

---

## ⚡ Quick Reference

| What You Want | Command |
|---------------|---------|
| Start Server | `npm start` |
| Quick Test | `npm run test:quick` |
| Full E2E Tests | `npm run test:e2e` |
| Cypress UI | `npm run test:cypress:open` |
| Batch File | `.\run-tests-auto.bat` |

---

## 🐛 Common PowerShell Issues

### ❌ Wrong:
```powershell
run-quick-test.bat
```

### ✅ Correct:
```powershell
.\run-quick-test.bat
```

### ✅ Best (Works Everywhere):
```powershell
npm run test:quick
```

---

## 📋 Complete Testing Workflow

```powershell
# 1. Open PowerShell Terminal 1
npm start

# 2. Open PowerShell Terminal 2
npm run test:quick      # Verify everything works (30s)
npm run test:e2e        # Run full tests (5-10min)

# 3. View results
start iamcalling\test-report.html
```

---

## 🎉 That's It!

**Just use NPM scripts - they work perfectly in PowerShell!**

```powershell
npm start              # Terminal 1
npm run test:quick     # Terminal 2
```
