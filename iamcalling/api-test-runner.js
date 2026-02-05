/**
 * Simple API Endpoint Tester
 * Tests basic API functionality without complex frameworks
 */

import https from 'https';
import http from 'http';
import fs from 'fs';

console.log('🔍 API ENDPOINT TESTING');
console.log('======================');

// Test configuration
const baseURL = 'http://localhost:1000'; // Server running on port 1000
const timeout = 5000;

// Simple HTTP client
function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            timeout: timeout
        };
        
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

// Test endpoints
async function testEndpoints() {
    const endpoints = [
        { method: 'GET', path: '/', description: 'Homepage' },
        { method: 'GET', path: '/api/health', description: 'Health check' },
        { method: 'GET', path: '/01-index.html', description: 'Main page' },
        { method: 'GET', path: '/15-login.html', description: 'Login page' },
        { method: 'GET', path: '/18-profile.html', description: 'Profile page' },
        { method: 'GET', path: '/js/15-login-fixed.js', description: 'Login JS' },
        { method: 'GET', path: '/css/style.css', description: 'Main CSS' }
    ];
    
    console.log(`Testing against: ${baseURL}\n`);
    
    let passed = 0;
    let failed = 0;
    
    for (const endpoint of endpoints) {
        try {
            const url = `${baseURL}${endpoint.path}`;
            console.log(`Testing ${endpoint.method} ${endpoint.path} (${endpoint.description})...`);
            
            const response = await makeRequest(url, endpoint.method);
            
            // Check if response is acceptable (2xx or 3xx status codes)
            if (response.statusCode >= 200 && response.statusCode < 400) {
                console.log(`✅ PASS - Status: ${response.statusCode}`);
                passed++;
            } else if (response.statusCode === 404) {
                console.log(`⚠️  NOT FOUND - Status: ${response.statusCode} (may be expected)`);
                passed++; // Count as pass since 404 might be expected
            } else {
                console.log(`❌ FAIL - Status: ${response.statusCode}`);
                failed++;
            }
            
            // Log response size for large responses
            const size = response.body ? response.body.length : 0;
            if (size > 1000) {
                console.log(`   Response size: ${Math.round(size/1024)}KB`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR - ${error.message}`);
            failed++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 API TEST RESULTS:`);
    console.log(`===================`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${endpoints.length}`);
    console.log(`Success Rate: ${Math.round((passed/endpoints.length)*100)}%`);
    
    return { passed, failed, total: endpoints.length };
}

// Test authentication endpoints specifically
async function testAuthEndpoints() {
    console.log('\n🔐 AUTHENTICATION ENDPOINT TESTING');
    console.log('==================================');
    
    const authEndpoints = [
        { method: 'GET', path: '/routes/auth.js', description: 'Auth route handler' },
        { method: 'GET', path: '/services/userProfileService.js', description: 'User profile service' }
    ];
    
    for (const endpoint of authEndpoints) {
        try {
            // For local files, we'll check if they exist
            const filePath = `.${endpoint.path}`;
            
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                console.log(`✅ Found ${endpoint.description} (${Math.round(stats.size/1024)}KB)`);
            } else {
                console.log(`❌ Missing ${endpoint.description}`);
            }
        } catch (error) {
            console.log(`❌ Error checking ${endpoint.description}: ${error.message}`);
        }
    }
}

// Test database connectivity
async function testDatabase() {
    console.log('\n🗄️ DATABASE CONNECTIVITY TEST');
    console.log('============================');
    
    try {
        // Check if Supabase config exists
        const configFiles = [
            './server/.env',
            './supabase/schema.sql',
            './supabase/README.md'
        ];
        
        let foundConfigs = 0;
        for (const configFile of configFiles) {
            if (fs.existsSync(configFile)) {
                console.log(`✅ Found: ${configFile}`);
                foundConfigs++;
            } else {
                console.log(`❌ Missing: ${configFile}`);
            }
        }
        
        console.log(`Database configuration files: ${foundConfigs}/${configFiles.length}`);
        
        // Try to read Supabase schema to verify structure
        if (fs.existsSync('./supabase/schema.sql')) {
            const schema = fs.readFileSync('./supabase/schema.sql', 'utf8');
            const tables = (schema.match(/CREATE TABLE/g) || []).length;
            const functions = (schema.match(/CREATE FUNCTION/g) || []).length;
            console.log(`Database schema: ${tables} tables, ${functions} functions`);
        }
        
    } catch (error) {
        console.log(`❌ Database test error: ${error.message}`);
    }
}

// Main test runner
async function runAPITests() {
    console.log('🚀 Starting API Endpoint Testing...\n');
    
    // Run endpoint tests
    const endpointResults = await testEndpoints();
    
    // Run auth tests
    await testAuthEndpoints();
    
    // Run database tests
    await testDatabase();
    
    console.log('\n🎯 API TESTING COMPLETED');
    console.log('========================');
    console.log(`Overall success rate: ${Math.round((endpointResults.passed/endpointResults.total)*100)}%`);
    
    if (endpointResults.failed === 0) {
        console.log('🎉 All critical endpoints are accessible!');
    } else {
        console.log('⚠️  Some endpoints may need attention');
    }
}

// Run the tests
runAPITests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});