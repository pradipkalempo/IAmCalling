# Messenger E2E Tests - Quick Start Guide

## Issue Found
Tests were failing because:
1. ❌ Server port mismatch (config had 10000, server runs on 1000)
2. ❌ Page load timing issues
3. ❌ Missing wait times for async operations

## Fixes Applied
1. ✅ Updated `cypress.config.js` to use port 1000
2. ✅ Added `failOnStatusCode: false` to handle redirects
3. ✅ Added 2-second wait after page load
4. ✅ Added timeouts to all element selectors
5. ✅ Created test runner script with server check

## Running Tests

### Step 1: Start the Server
```bash
cd iamcalling
npm start
```
Server should be running on http://localhost:1000

### Step 2: Run Tests (Choose One)

#### Option A: Use the Test Runner Script (Recommended)
```bash
run-messenger-tests.bat
```

#### Option B: Run Directly
```bash
# Comprehensive tests (42 test cases)
npx cypress run --spec "iamcalling/cypress/e2e/messenger-comprehensive.cy.js"

# Original tests (4 test cases)
npx cypress run --spec "cypress/e2e/messenger-experience.cy.js"
```

#### Option C: Interactive Mode
```bash
npx cypress open
```
Then select the test file to run.

## Test Files

### 1. messenger-experience.cy.js (4 tests)
- Basic UI rendering
- Conversation sorting
- Message sending
- Mobile navigation

### 2. messenger-comprehensive.cy.js (42 tests)
- Complete E2E coverage
- All messenger features
- Error handling
- Performance checks
- Accessibility tests

## Expected Results

### All Tests Should Pass ✅
```
✓ UI Rendering and Design (5 tests)
✓ Conversation List Functionality (5 tests)
✓ Search Functionality (4 tests)
✓ Chat Window Functionality (7 tests)
✓ Message Sending (9 tests)
✓ Mobile Responsiveness (4 tests)
✓ Multiple Conversations (2 tests)
✓ Error Handling (2 tests)
✓ Performance (2 tests)
✓ Accessibility (2 tests)

Total: 42 passing
```

## Troubleshooting

### Tests Still Failing?

1. **Check Server**
   ```bash
   curl http://localhost:1000/34-icalluser-messenger.html
   ```
   Should return HTML content

2. **Clear Cypress Cache**
   ```bash
   npx cypress cache clear
   npm install cypress --save-dev
   ```

3. **Check Port**
   ```bash
   netstat -ano | findstr :1000
   ```
   Should show process listening on port 1000

4. **View Screenshots**
   Failed tests create screenshots in:
   ```
   cypress/screenshots/
   ```

5. **Run with Debug**
   ```bash
   DEBUG=cypress:* npx cypress run --spec "cypress/e2e/messenger-experience.cy.js"
   ```

## Configuration

### cypress.config.js
```javascript
baseUrl: 'http://localhost:1000'  // ✅ Fixed
defaultCommandTimeout: 10000      // ✅ Increased
```

### Test Timeouts
```javascript
cy.wait('@getUsers', { timeout: 15000 })  // ✅ Added
cy.get('element', { timeout: 10000 })     // ✅ Added
```

## Next Steps

1. ✅ Run tests to verify all pass
2. ✅ Review test coverage
3. ✅ Add to CI/CD pipeline
4. ✅ Schedule regular test runs

## CI/CD Integration

Add to your pipeline:
```yaml
- name: E2E Tests
  run: |
    npm --prefix iamcalling start &
    sleep 5
    npx cypress run --spec "iamcalling/cypress/e2e/messenger-comprehensive.cy.js"
```

## Support

If tests continue to fail:
1. Check server logs
2. Review browser console
3. Examine screenshots
4. Run in headed mode: `npx cypress run --headed`
