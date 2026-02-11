# Messenger Module - Comprehensive E2E Testing

## Overview
Comprehensive end-to-end Cypress tests for the IAMCALLING messenger module covering all functionality including UI rendering, messaging, search, mobile responsiveness, and error handling.

## Test Coverage

### 1. UI Rendering and Design (5 tests)
- Core UI elements rendering
- Design tokens and styling
- User avatars with fallback
- Online status indicators

### 2. Conversation List Functionality (5 tests)
- User loading and display
- Sorting by latest message
- Unread message badges
- Last message preview
- Message timestamps

### 3. Search Functionality (4 tests)
- Filter by user name
- Case-insensitive search
- Clear search results
- No results handling

### 4. Chat Window Functionality (7 tests)
- Open chat window
- Load and display messages
- Sent/received message styling
- User status display
- Clear unread badges
- Active conversation highlighting

### 5. Message Sending (9 tests)
- Send text messages
- Enter key submission
- Clear input after send
- Prevent empty messages
- Message timestamps
- Delivery status icons
- Auto-scroll to bottom
- Move conversation to top
- Update last message preview

### 6. Mobile Responsiveness (4 tests)
- Back button visibility
- Navigation on mobile
- Desktop layout
- Side-by-side view

### 7. Multiple Conversations (2 tests)
- Switch between conversations
- Separate message history

### 8. Error Handling (2 tests)
- API failure handling
- Message send failures

### 9. Performance (2 tests)
- User load time
- Efficient rendering

### 10. Accessibility (2 tests)
- Input labels and placeholders
- Keyboard navigation

## Total Tests: 42 comprehensive test cases

## Prerequisites

```bash
cd iamcalling
npm install
```

## Running Tests

### Run all messenger tests (headless)
```bash
npm run test:messenger
```

### Open Cypress Test Runner (interactive)
```bash
npm run test:messenger:open
```

### Run with browser visible
```bash
npm run test:messenger:headed
```

### Run mobile viewport tests
```bash
npm run test:messenger:mobile
```

### Run desktop viewport tests
```bash
npm run test:messenger:desktop
```

### Run all Cypress tests
```bash
npm run test:all
```

## Test Structure

```
cypress/
├── e2e/
│   └── messenger-comprehensive.cy.js  (42 tests)
├── package.json
└── README.md
```

## Test Scenarios Covered

### User Interactions
✅ Load conversation list
✅ Search for users
✅ Open conversations
✅ Send messages
✅ Switch between chats
✅ Navigate back (mobile)

### UI/UX Validation
✅ Design tokens applied
✅ Responsive layouts
✅ Avatar fallbacks
✅ Status indicators
✅ Unread badges
✅ Message styling

### Data Flow
✅ API integration
✅ Message persistence
✅ Real-time updates
✅ Conversation sorting
✅ Unread count tracking

### Edge Cases
✅ Empty messages
✅ API failures
✅ No search results
✅ Missing avatars
✅ Network errors

## Configuration

Tests use mock Supabase data with:
- 3 test users
- 5 mock messages
- Stubbed real-time subscriptions
- Intercepted API calls

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Messenger E2E Tests
  run: |
    cd iamcalling
    npm install
    npm run test:messenger
```

## Viewing Results

Test results include:
- Screenshots on failure
- Video recordings (optional)
- Detailed console logs
- Performance metrics

## Troubleshooting

### Tests failing?
1. Ensure server is running on `http://localhost:1000`
2. Check Supabase configuration
3. Verify user data in localStorage
4. Review console logs

### Slow tests?
1. Reduce viewport size
2. Disable video recording
3. Use headless mode
4. Check network throttling

## Contributing

When adding new messenger features:
1. Add corresponding test cases
2. Update test count in README
3. Ensure all tests pass
4. Document new scenarios

## Test Maintenance

- Review tests monthly
- Update mock data as needed
- Add tests for new features
- Remove obsolete tests
- Keep dependencies updated

## Support

For issues or questions:
- Check test logs
- Review Cypress documentation
- Contact development team
