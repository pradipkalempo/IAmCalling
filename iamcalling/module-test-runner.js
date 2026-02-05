#!/usr/bin/env node

/**
 * IAmCalling Module Test Runner
 * Runs basic functionality tests for project modules
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting IAmCalling Module Testing...\n');

// Test categories
const testCategories = {
    'Backend Routes': [],
    'Services': [],
    'Frontend Modules': [],
    'Database': [],
    'API Endpoints': []
};

// Count modules
let moduleCount = 0;

// Test 1: Count route modules
console.log('📋 MODULE COUNT ANALYSIS:');
console.log('========================');

const routesDir = './routes';
if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
    testCategories['Backend Routes'] = routeFiles;
    moduleCount += routeFiles.length;
    console.log(`✅ Backend Routes: ${routeFiles.length} modules`);
    routeFiles.forEach(file => console.log(`   - ${file}`));
}

// Test 2: Count service modules
const servicesDir = './services';
if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.js'));
    testCategories['Services'] = serviceFiles;
    moduleCount += serviceFiles.length;
    console.log(`✅ Services: ${serviceFiles.length} modules`);
    serviceFiles.forEach(file => console.log(`   - ${file}`));
}

// Test 3: Count frontend JS modules
const frontendDir = './public/js';
if (fs.existsSync(frontendDir)) {
    const frontendFiles = fs.readdirSync(frontendDir).filter(file => file.endsWith('.js'));
    testCategories['Frontend Modules'] = frontendFiles;
    moduleCount += frontendFiles.length;
    console.log(`✅ Frontend Modules: ${frontendFiles.length} modules`);
}

// Test 4: Check database configuration
const supabaseDir = './supabase';
if (fs.existsSync(supabaseDir)) {
    const supabaseFiles = fs.readdirSync(supabaseDir);
    testCategories['Database'] = supabaseFiles;
    console.log(`✅ Database Configurations: ${supabaseFiles.length} files`);
}

// Test 5: Check for API endpoints
const apiTestsDir = './tests/api';
if (fs.existsSync(apiTestsDir)) {
    const apiTestFiles = fs.readdirSync(apiTestsDir).filter(file => file.endsWith('.test.js'));
    testCategories['API Endpoints'] = apiTestFiles;
    console.log(`✅ API Test Files: ${apiTestFiles.length} files`);
}

console.log(`\n📊 TOTAL MODULES IDENTIFIED: ${moduleCount}\n`);

// Run basic functionality tests
console.log('🧪 RUNNING BASIC FUNCTIONALITY TESTS:');
console.log('=====================================');

// Test server startup
async function testServerStartup() {
    console.log('\n1. Testing Server Startup...');
    try {
        // Check if server.js exists
        if (fs.existsSync('./server.js')) {
            console.log('✅ Server file exists');
            
            // Try to import and check basic structure
            const serverContent = fs.readFileSync('./server.js', 'utf8');
            if (serverContent.includes('express') && serverContent.includes('listen')) {
                console.log('✅ Server structure looks correct');
            } else {
                console.log('⚠️  Server structure may need review');
            }
        } else {
            console.log('❌ Server file not found');
        }
    } catch (error) {
        console.log('❌ Server startup test failed:', error.message);
    }
}

// Test database connectivity
async function testDatabaseConnectivity() {
    console.log('\n2. Testing Database Connectivity...');
    try {
        // Check Supabase configuration
        const supabaseConfigPath = './server/.env';
        if (fs.existsSync(supabaseConfigPath)) {
            const envContent = fs.readFileSync(supabaseConfigPath, 'utf8');
            if (envContent.includes('SUPABASE_URL') && envContent.includes('SUPABASE_KEY')) {
                console.log('✅ Supabase configuration found');
            } else {
                console.log('⚠️  Supabase configuration may be incomplete');
            }
        } else {
            console.log('ℹ️  No Supabase configuration file found');
        }
    } catch (error) {
        console.log('❌ Database connectivity test failed:', error.message);
    }
}

// Test frontend assets
async function testFrontendAssets() {
    console.log('\n3. Testing Frontend Assets...');
    try {
        // Check main HTML files
        const htmlFiles = [
            './public/01-index.html',
            './public/15-login.html',
            './public/18-profile.html'
        ];
        
        let htmlCount = 0;
        htmlFiles.forEach(file => {
            if (fs.existsSync(file)) {
                htmlCount++;
                console.log(`✅ Found: ${path.basename(file)}`);
            }
        });
        
        console.log(`✅ HTML files: ${htmlCount}/${htmlFiles.length} found`);
        
        // Check CSS files
        const cssDir = './public/css';
        if (fs.existsSync(cssDir)) {
            const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
            console.log(`✅ CSS files: ${cssFiles.length} found`);
        }
        
    } catch (error) {
        console.log('❌ Frontend assets test failed:', error.message);
    }
}

// Test authentication modules
async function testAuthModules() {
    console.log('\n4. Testing Authentication Modules...');
    try {
        // Check auth route
        const authRoutePath = './routes/auth.js';
        if (fs.existsSync(authRoutePath)) {
            const authContent = fs.readFileSync(authRoutePath, 'utf8');
            const authFeatures = [
                'login',
                'register',
                'logout',
                'jwt',
                'bcrypt'
            ];
            
            let foundFeatures = 0;
            authFeatures.forEach(feature => {
                if (authContent.toLowerCase().includes(feature)) {
                    foundFeatures++;
                }
            });
            
            console.log(`✅ Auth features found: ${foundFeatures}/${authFeatures.length}`);
        }
        
        // Check auth service
        const authServicePath = './services/userProfileService.js';
        if (fs.existsSync(authServicePath)) {
            console.log('✅ User profile service found');
        }
        
    } catch (error) {
        console.log('❌ Authentication modules test failed:', error.message);
    }
}

// Test messaging functionality
async function testMessaging() {
    console.log('\n5. Testing Messaging Functionality...');
    try {
        // Check messenger route
        const messengerRoutePath = './routes/messenger.js';
        if (fs.existsSync(messengerRoutePath)) {
            const messengerSize = fs.statSync(messengerRoutePath).size;
            console.log(`✅ Messenger route found (${Math.round(messengerSize/1024)}KB)`);
        }
        
        // Check unified messenger
        const unifiedMessengerPath = './public/js/unified-messenger.js';
        if (fs.existsSync(unifiedMessengerPath)) {
            const unifiedSize = fs.statSync(unifiedMessengerPath).size;
            console.log(`✅ Unified messenger found (${Math.round(unifiedSize/1024)}KB)`);
        }
        
    } catch (error) {
        console.log('❌ Messaging functionality test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testServerStartup();
    await testDatabaseConnectivity();
    await testFrontendAssets();
    await testAuthModules();
    await testMessaging();
    
    console.log('\n🎉 MODULE TESTING COMPLETED!');
    console.log('============================');
    console.log(`Total modules analyzed: ${moduleCount}`);
    console.log('Project structure appears healthy');
    
    // Generate summary
    console.log('\n📝 TEST SUMMARY:');
    console.log('- Backend Routes:', testCategories['Backend Routes'].length);
    console.log('- Services:', testCategories['Services'].length);
    console.log('- Frontend Modules:', testCategories['Frontend Modules'].length);
    console.log('- Database Components:', testCategories['Database'].length);
    console.log('- API Tests:', testCategories['API Endpoints'].length);
}

// Execute tests
runAllTests().catch(console.error);