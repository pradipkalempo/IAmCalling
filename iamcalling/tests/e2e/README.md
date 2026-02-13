# E2E Tests - IAMCALLING Platform

## Quick Start

```bash
# From project root
npm run test:quick      # Quick verification (30s)
npm run test:e2e        # Full E2E tests (5-10min)
npm run test:cypress:open  # Interactive UI
```

## Test File

- **comprehensive-platform-test.cy.js** - Main test suite with 50+ tests

## Test Categories

1. ✅ Page Loading (9 tests)
2. ✅ User Registration (3 tests)
3. ✅ Authentication (3 tests)
4. ✅ Profile & Data (4 tests)
5. ✅ Messenger (5 tests)
6. ✅ Article Creation (4 tests)
7. ✅ Post Creation (2 tests)
8. ✅ View Tracking (2 tests)
9. ✅ Ideology Analyzer (3 tests)
10. ✅ Political Battle (3 tests)
11. ✅ Supabase Connection (3 tests)
12. ✅ Cloudinary (2 tests)
13. ✅ Admin Dashboard (3 tests)
14. ✅ Navigation (3 tests)
15. ✅ Performance (2 tests)

## Requirements

- Server running on http://localhost:1000
- Supabase configured
- Cloudinary configured
- Cypress installed

## Documentation

See root directory:
- `E2E_TESTING_GUIDE.md` - Complete guide
- `E2E_TESTING_CHECKLIST.md` - Manual testing
- `E2E_TESTING_SUMMARY.md` - Overview
