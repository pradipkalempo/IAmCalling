#!/usr/bin/env node

/**
 * Quick E2E Verification Script
 * Tests critical platform features without Cypress
 */

import http from 'http';
import https from 'https';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   IAMCALLING - Quick E2E Verification                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const baseUrl = 'http://localhost:1000';
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test helper
const test = (name, fn) => {
  return fn()
    .then(() => {
      console.log(`✅ ${name}`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED' });
    })
    .catch((err) => {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${err.message}`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: err.message });
    });
};

// HTTP request helper
const makeRequest = (url, method = 'GET', data = null, customTimeout = 5000) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: customTimeout,
      headers: {
        'User-Agent': 'E2E-Test-Script'
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Run all tests
(async () => {
  console.log('🔍 Running Quick E2E Tests...\n');
  console.log('─'.repeat(60) + '\n');

  // 1. Health endpoint
  await test('Health endpoint responds', async () => {
    const res = await makeRequest(`${baseUrl}/api/health`);
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
  });

  // 2. Config endpoint
  await test('Config endpoint provides Supabase credentials', async () => {
    const res = await makeRequest(`${baseUrl}/config.js`);
    if (!res.body.includes('supabaseUrl')) throw new Error('Missing Supabase config');
  });

  // 3. Static pages load
  const pages = [
    '/15-login.html',
    '/16-register.html',
    '/18-profile.html',
    '/22-write_article.html',
    '/34-icalluser-messenger.html',
    '/09-ideology-analyzer.html',
    '/10-ideological-battle.html',
    '/39-admin-login.html'
  ];

  for (const page of pages) {
    await test(`Page loads: ${page}`, async () => {
      const res = await makeRequest(`${baseUrl}${page}`);
      if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
      if (!res.body.includes('<!DOCTYPE html>')) throw new Error('Invalid HTML');
    });
  }

  // 4. API endpoints (with longer timeout for database queries)
  await test('Posts API endpoint exists', async () => {
    const res = await makeRequest(`${baseUrl}/api/posts`, 'GET', null, 10000);
    if (res.statusCode >= 500) throw new Error(`Server error: ${res.statusCode}`);
  });

  await test('Auth API endpoint exists', async () => {
    const res = await makeRequest(`${baseUrl}/api/auth/status`, 'GET', null, 10000);
    if (res.statusCode >= 500) throw new Error(`Server error: ${res.statusCode}`);
  });

  // 5. Static assets
  await test('CSS files accessible', async () => {
    const res = await makeRequest(`${baseUrl}/css/style.css`);
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
  });

  await test('JavaScript files accessible', async () => {
    const res = await makeRequest(`${baseUrl}/js/universal-auth.js`);
    if (res.statusCode !== 200) throw new Error(`Status: ${res.statusCode}`);
  });

  // 6. Environment check
  await test('Environment variables loaded', async () => {
    const res = await makeRequest(`${baseUrl}/config.js`);
    const config = res.body;
    if (!config.includes('supabaseUrl') || config.includes('undefined')) {
      throw new Error('Environment variables not properly loaded');
    }
  });

  // Print results
  console.log('\n' + '─'.repeat(60) + '\n');
  console.log('📊 Test Results:\n');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📝 Total:  ${results.passed + results.failed}\n`);

  if (results.failed > 0) {
    console.log('❌ Failed Tests:\n');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => {
        console.log(`   • ${t.name}`);
        console.log(`     ${t.error}\n`);
      });
  }

  console.log('─'.repeat(60) + '\n');

  if (results.failed === 0) {
    console.log('✅ All quick tests passed! Ready for full E2E testing.\n');
    console.log('Run full tests with: node run-e2e-tests.js\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please fix issues before running full E2E tests.\n');
    process.exit(1);
  }
})();
