#!/usr/bin/env node

/**
 * IAMCALLING Platform - E2E Test Runner
 * Executes comprehensive end-to-end tests and generates reports
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   IAMCALLING Platform - E2E Testing Suite                 ║');
console.log('║   Comprehensive Testing: All Features                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Test configuration
const testConfig = {
  baseUrl: 'http://localhost:1000',
  browser: 'chrome',
  headless: true,
  video: false,
  screenshots: true
};

// Test categories
const testCategories = [
  '1. Page Loading Tests',
  '2. User Registration',
  '3. Authentication & Session',
  '4. Profile & Data Loading',
  '5. Messenger & Real-time',
  '6. Article Creation',
  '7. Post Creation',
  '8. View Count Tracking',
  '9. Ideology Analyzer',
  '10. Ideological Battle',
  '11. Supabase Connection',
  '12. Cloudinary Connection',
  '13. Admin Dashboard',
  '14. Universal Navigation',
  '15. Performance Tests'
];

console.log('📋 Test Categories:\n');
testCategories.forEach(category => {
  console.log(`   ✓ ${category}`);
});

console.log('\n' + '─'.repeat(60) + '\n');

// Check if server is running
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 1000,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', (err) => {
      reject(false);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(false);
    });

    req.end();
  });
};

// Run Cypress tests
const runTests = () => {
  console.log('🚀 Starting Cypress E2E Tests...\n');

  const cypressCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = [
    'cypress',
    'run',
    '--spec',
    'tests/e2e/comprehensive-platform-test.cy.js',
    '--browser',
    testConfig.browser,
    '--config',
    `baseUrl=${testConfig.baseUrl},video=${testConfig.video},screenshotOnRunFailure=${testConfig.screenshots}`
  ];

  if (testConfig.headless) {
    args.push('--headless');
  }

  const cypress = spawn(cypressCmd, args, {
    stdio: 'inherit',
    shell: true
  });

  cypress.on('close', (code) => {
    console.log('\n' + '─'.repeat(60) + '\n');
    
    if (code === 0) {
      console.log('✅ All tests passed successfully!\n');
      generateReport('PASSED');
    } else {
      console.log('❌ Some tests failed. Check the output above.\n');
      generateReport('FAILED');
    }
    
    process.exit(code);
  });

  cypress.on('error', (err) => {
    console.error('❌ Failed to start Cypress:', err);
    process.exit(1);
  });
};

// Generate test report
const generateReport = (status) => {
  const report = {
    timestamp: new Date().toISOString(),
    status: status,
    testConfig: testConfig,
    categories: testCategories,
    platform: process.platform,
    nodeVersion: process.version
  };

  const reportPath = path.join(__dirname, 'test-reports', `e2e-report-${Date.now()}.json`);
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Test report saved: ${reportPath}\n`);
};

// Main execution
(async () => {
  try {
    console.log('🔍 Checking if server is running...');
    await checkServer();
    console.log('✅ Server is running on http://localhost:1000\n');
    console.log('─'.repeat(60) + '\n');
    
    runTests();
  } catch (error) {
    console.error('❌ Server is not running on http://localhost:1000');
    console.error('   Please start the server first: npm start\n');
    process.exit(1);
  }
})();
