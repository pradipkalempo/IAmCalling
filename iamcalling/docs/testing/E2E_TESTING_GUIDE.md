# IAMCALLING Platform - End-to-End Testing Guide

## Overview

This comprehensive E2E testing suite validates all critical features of the IAMCALLING platform including:

- ✅ Page loading and navigation
- ✅ User registration and authentication
- ✅ Profile management and data loading
- ✅ Real-time messenger functionality
- ✅ Article and post creation
- ✅ View count tracking
- ✅ Ideology analyzer logic
- ✅ Political battle game
- ✅ Supabase database connection
- ✅ Cloudinary image service
- ✅ Admin dashboard
- ✅ Universal navigation bar
- ✅ Performance metrics

## Prerequisites

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Cypress (if not already installed)

```bash
npm install --save-dev cypress
```

### 3. Environment Setup

Ensure your `.env` file is properly configured:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_PASSWORD=your-admin-password
PORT=1000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### 4. Start the Server

```bash
npm start
```

The server should be running on `http://localhost:1000`

## Running Tests

### Option 1: Quick Verification Test (Recommended First)

Run a quick test to verify all endpoints and connections:

```bash
node quick-e2e-test.js
```

This will:
- ✅ Check if server is running
- ✅ Verify all pages load
- ✅ Test API endpoints
- ✅ Validate Supabase connection
- ✅ Check static assets

**Expected Output:**
```
✅ Server is running
✅ Health endpoint responds
✅ Config endpoint provides Supabase credentials
✅ Page loads: /15-login.html
✅ Page loads: /16-register.html
...
📊 Test Results:
   ✅ Passed: 15
   ❌ Failed: 0
```

### Option 2: Full Cypress E2E Tests

Run the comprehensive test suite:

```bash
node run-e2e-tests.js
```

Or run Cypress directly:

```bash
npx cypress run --spec tests/e2e/comprehensive-platform-test.cy.js
```

### Option 3: Interactive Cypress UI

Open Cypress Test Runner for interactive testing:

```bash
npx cypress open
```

Then select `comprehensive-platform-test.cy.js` from the test list.

### Option 4: Manual Testing

Use the comprehensive checklist:

```bash
# Open the checklist
cat E2E_TESTING_CHECKLIST.md
```

Print and fill out the checklist while manually testing each feature.

## Test Categories

### 1. Page Loading Tests (9 tests)
- Home page
- Login page
- Register page
- Profile page
- Messenger
- Write article
- Ideology analyzer
- Political battle
- Admin pages

### 2. User Registration (3 tests)
- New user registration
- Duplicate prevention
- Validation rules

### 3. Authentication & Session (3 tests)
- Login with valid credentials
- Reject invalid credentials
- Session persistence

### 4. Profile & Data Loading (4 tests)
- Profile data display
- Unread message count
- User articles and posts
- Profile editing

### 5. Messenger & Real-time (5 tests)
- Quick loading
- User list display
- Send messages
- Real-time updates
- WebSocket connection

### 6. Article Creation (4 tests)
- Editor loading
- Create and publish
- Validation
- Post-publication

### 7. Post Creation (2 tests)
- Create post
- Post features

### 8. View Count Tracking (2 tests)
- Article views
- Post views

### 9. Ideology Analyzer (3 tests)
- Quiz interface
- Question processing
- Score calculation

### 10. Political Battle (3 tests)
- Battle arena
- Fighter selection
- Round tracking

### 11. Supabase Connection (3 tests)
- Database connection
- Data fetching
- Realtime features

### 12. Cloudinary Connection (2 tests)
- Image loading
- Image upload

### 13. Admin Dashboard (3 tests)
- Admin login
- Dashboard display
- Admin statistics

### 14. Universal Navigation (3 tests)
- Display on all pages
- Navigation links
- User menu

### 15. Performance Tests (2 tests)
- Page load times
- Messenger load time

**Total: 50+ comprehensive tests**

## Test Data

### Test Users

The tests will create a new user with random credentials:
```javascript
{
  email: `test_${Date.now()}@example.com`,
  password: 'Test@12345',
  username: `testuser_${Date.now()}`
}
```

### Existing User (for login tests)

Update in the test file if needed:
```javascript
{
  email: 'existing@test.com',
  password: 'Test@12345'
}
```

## Troubleshooting

### Server Not Running

```bash
❌ Server is not running on http://localhost:1000
```

**Solution:** Start the server first:
```bash
npm start
```

### Cypress Not Found

```bash
❌ Failed to start Cypress
```

**Solution:** Install Cypress:
```bash
npm install --save-dev cypress
```

### Test Failures

If tests fail, check:

1. **Server is running** on port 1000
2. **Environment variables** are set correctly
3. **Database connection** is working
4. **Cloudinary credentials** are valid
5. **Test user** doesn't already exist

### Port Already in Use

```bash
Error: listen EADDRINUSE: address already in use :::1000
```

**Solution:** Kill the process using port 1000:

**Windows:**
```bash
netstat -ano | findstr :1000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:1000 | xargs kill -9
```

### Supabase Connection Issues

```bash
❌ Supabase connection failed
```

**Solution:** Verify your Supabase credentials:
```bash
node -e "console.log(require('dotenv').config()); console.log(process.env.SUPABASE_URL)"
```

## Test Reports

### Automated Reports

Test reports are automatically generated in:
```
iamcalling/test-reports/e2e-report-{timestamp}.json
```

### Cypress Reports

Cypress generates:
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/` (if enabled)
- Test results: Console output

### Manual Checklist

Fill out the manual checklist:
```
E2E_TESTING_CHECKLIST.md
```

## Continuous Integration

### GitHub Actions

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm start &
      - run: sleep 10
      - run: node quick-e2e-test.js
      - run: node run-e2e-tests.js
```

## Best Practices

### Before Running Tests

1. ✅ Ensure server is running
2. ✅ Database is accessible
3. ✅ Test data is prepared
4. ✅ Environment variables are set
5. ✅ No other tests are running

### During Testing

1. 📝 Monitor console output
2. 📸 Check screenshots on failures
3. 🔍 Review error messages
4. ⏱️ Note performance metrics

### After Testing

1. 📊 Review test reports
2. 🐛 Document any bugs found
3. ✅ Update test cases if needed
4. 🔄 Re-run failed tests

## Performance Benchmarks

### Expected Load Times

- **Home Page:** < 3 seconds
- **Login Page:** < 2 seconds
- **Profile Page:** < 3 seconds
- **Messenger:** < 5 seconds
- **Article Page:** < 3 seconds

### API Response Times

- **Authentication:** < 1 second
- **Data Fetch:** < 2 seconds
- **Image Upload:** < 5 seconds
- **Message Send:** < 1 second

## Support

### Issues

If you encounter issues:

1. Check the troubleshooting section
2. Review test logs
3. Verify environment setup
4. Check server logs

### Contact

**Author:** Pradip Kale - Data Engineer
- LinkedIn: [pradip-kale-a116112a0](https://www.linkedin.com/in/pradip-kale-a116112a0)

## License

PK Venture's

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Run quick test (in new terminal)
node quick-e2e-test.js

# 4. Run full E2E tests
node run-e2e-tests.js

# 5. Open Cypress UI
npx cypress open
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
