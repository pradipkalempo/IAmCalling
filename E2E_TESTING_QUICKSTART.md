# 🧪 E2E Testing - Quick Start

## From Root Directory (E:\Icu_updated.1)

### Option 1: Using NPM Scripts (Recommended)

```bash
# Quick verification (30 seconds)
npm run test:quick

# Full E2E tests (5-10 minutes)
npm run test:e2e

# Open Cypress UI
npm run test:cypress:open

# Run all tests
npm run test:all
```

### Option 2: Using Batch Files (Windows)

```bash
# Quick test
run-quick-test.bat

# Full tests
run-full-tests.bat
```

### Option 3: From iamcalling Directory

```bash
cd iamcalling

# Quick test
node quick-e2e-test.js

# Full E2E tests
node run-e2e-tests.js

# Cypress tests
npx cypress run --spec tests/e2e/comprehensive-platform-test.cy.js
```

## Prerequisites

1. **Start the server first:**
   ```bash
   npm start
   ```
   Server should be running on http://localhost:1000

2. **Install dependencies (if not done):**
   ```bash
   npm install
   cd iamcalling
   npm install
   ```

## Test Coverage

✅ 50+ automated tests covering:
- Page loading
- User authentication
- Profile management
- Real-time messenger
- Article/post creation
- View tracking
- Ideology analyzer
- Political battle
- Database connections
- Admin dashboard
- Performance

## Documentation

All documentation is in the `iamcalling` folder:
- `E2E_TESTING_GUIDE.md` - Complete guide
- `E2E_TESTING_CHECKLIST.md` - Manual checklist
- `E2E_TESTING_SUMMARY.md` - Overview
- `test-report.html` - Visual report

## Quick Commands Summary

```bash
# From root directory (E:\Icu_updated.1)
npm start              # Start server
npm run test:quick     # Quick test (30s)
npm run test:e2e       # Full tests (5-10min)

# Or use batch files
run-quick-test.bat     # Quick test
run-full-tests.bat     # Full tests
```

## Troubleshooting

**Error: Server not running**
```bash
npm start
```

**Error: Missing dependencies**
```bash
npm install
cd iamcalling && npm install
```

**Error: Port 1000 in use**
```bash
netstat -ano | findstr :1000
taskkill /PID <PID> /F
```

---

**Ready to test!** Run: `npm run test:quick`
