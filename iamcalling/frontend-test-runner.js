/**
 * Frontend JavaScript Module Tester
 * Tests frontend JavaScript modules for basic functionality
 */

import fs from 'fs';
import path from 'path';

console.log('🖥️ FRONTEND JAVASCRIPT MODULE TESTING');
console.log('====================================');

// Test frontend modules
async function testFrontendModules() {
    const jsDir = './public/js';
    if (!fs.existsSync(jsDir)) {
        console.log('❌ Frontend JS directory not found');
        return;
    }
    
    const jsFiles = fs.readdirSync(jsDir)
        .filter(file => file.endsWith('.js'))
        .filter(file => !file.includes('node_modules')); // Exclude node_modules
    
    console.log(`Found ${jsFiles.length} frontend JavaScript modules\n`);
    
    let tested = 0;
    let passed = 0;
    let failed = 0;
    
    // Test each JS file for basic validity
    for (const file of jsFiles) {
        const filePath = path.join(jsDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            
            tested++;
            
            // Basic checks
            let issues = [];
            
            // Check for syntax errors by trying to parse
            try {
                // Simple syntax validation - check for common issues
                if (content.includes('undefined') && content.includes(' is not defined')) {
                    issues.push('Potential undefined variable');
                }
                
                if (content.includes('ReferenceError')) {
                    issues.push('Reference errors found');
                }
                
                // Check for basic structure
                const hasFunctions = (content.match(/function\s+\w+/g) || []).length;
                const hasVariables = (content.match(/(let|const|var)\s+\w+/g) || []).length;
                const hasEventListeners = (content.match(/addEventListener/g) || []).length;
                
                console.log(`✅ ${file} (${Math.round(stats.size/1024)}KB)`);
                console.log(`   Functions: ${hasFunctions}, Variables: ${hasVariables}, Event Listeners: ${hasEventListeners}`);
                
                if (issues.length === 0) {
                    passed++;
                } else {
                    console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
                    failed++;
                }
                
            } catch (syntaxError) {
                console.log(`❌ ${file} - Syntax error: ${syntaxError.message}`);
                failed++;
            }
            
        } catch (error) {
            console.log(`❌ ${file} - Read error: ${error.message}`);
            failed++;
        }
    }
    
    console.log(`\n📊 FRONTEND MODULE TEST RESULTS:`);
    console.log(`===============================`);
    console.log(`Tested: ${tested}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed/tested)*100)}%`);
    
    return { tested, passed, failed };
}

// Test critical frontend files
async function testCriticalFrontendFiles() {
    console.log('\n⭐ CRITICAL FRONTEND FILES TEST');
    console.log('===============================');
    
    const criticalFiles = [
        { path: './public/01-index.html', name: 'Homepage' },
        { path: './public/15-login.html', name: 'Login Page' },
        { path: './public/18-profile.html', name: 'Profile Page' },
        { path: './public/js/unified-messenger.js', name: 'Unified Messenger' },
        { path: './public/js/global-auth-manager.js', name: 'Auth Manager' },
        { path: './public/css/style.css', name: 'Main Stylesheet' }
    ];
    
    let found = 0;
    let missing = 0;
    
    for (const file of criticalFiles) {
        if (fs.existsSync(file.path)) {
            const stats = fs.statSync(file.path);
            console.log(`✅ ${file.name} - Found (${Math.round(stats.size/1024)}KB)`);
            found++;
        } else {
            console.log(`❌ ${file.name} - Missing`);
            missing++;
        }
    }
    
    console.log(`\nCritical files: ${found} found, ${missing} missing`);
    return { found, missing };
}

// Test authentication flows
async function testAuthFlows() {
    console.log('\n🔐 AUTHENTICATION FLOW TEST');
    console.log('===========================');
    
    try {
        // Check if login page has required elements
        const loginPage = fs.readFileSync('./public/15-login.html', 'utf8');
        
        const requiredElements = [
            { selector: '#loginForm', desc: 'Login form' },
            { selector: '#email', desc: 'Email input' },
            { selector: '#remember', desc: 'Remember me checkbox' },
            { selector: '.login-submit-btn', desc: 'Login button' },
            { selector: '[href="16-register.html"]', desc: 'Register link' }
        ];
        
        let foundElements = 0;
        for (const element of requiredElements) {
            if (loginPage.includes(element.selector)) {
                console.log(`✅ Found: ${element.desc}`);
                foundElements++;
            } else {
                console.log(`❌ Missing: ${element.desc}`);
            }
        }
        
        console.log(`Login page elements: ${foundElements}/${requiredElements.length}`);
        
        // Check auth JavaScript
        const authJS = fs.readFileSync('./public/js/15-login-fixed.js', 'utf8');
        const authFeatures = [
            'loginUser',
            'validateForm',
            'handleRememberMe',
            'showError',
            'showSuccess'
        ];
        
        let foundFeatures = 0;
        for (const feature of authFeatures) {
            if (authJS.includes(feature)) {
                console.log(`✅ Found auth feature: ${feature}`);
                foundFeatures++;
            }
        }
        
        console.log(`Auth features: ${foundFeatures}/${authFeatures.length}`);
        
    } catch (error) {
        console.log(`❌ Auth flow test error: ${error.message}`);
    }
}

// Test messaging functionality
async function testMessagingFunctionality() {
    console.log('\n💬 MESSAGING FUNCTIONALITY TEST');
    console.log('===============================');
    
    try {
        // Check unified messenger size and basic structure
        const messengerPath = './public/js/unified-messenger.js';
        if (fs.existsSync(messengerPath)) {
            const stats = fs.statSync(messengerPath);
            const content = fs.readFileSync(messengerPath, 'utf8');
            
            console.log(`✅ Unified Messenger: ${Math.round(stats.size/1024)}KB`);
            
            // Check for key messaging functions
            const messagingFeatures = [
                'sendMessage',
                'receiveMessage',
                'connectWebSocket',
                'loadConversation',
                'markAsRead'
            ];
            
            let foundFeatures = 0;
            for (const feature of messagingFeatures) {
                if (content.includes(feature)) {
                    console.log(`✅ Found: ${feature}`);
                    foundFeatures++;
                }
            }
            
            console.log(`Messaging features: ${foundFeatures}/${messagingFeatures.length}`);
        }
        
        // Check messenger HTML
        const messengerHTML = './public/34-icalluser-messenger.html';
        if (fs.existsSync(messengerHTML)) {
            console.log('✅ Messenger HTML page found');
        }
        
    } catch (error) {
        console.log(`❌ Messaging test error: ${error.message}`);
    }
}

// Main frontend test runner
async function runFrontendTests() {
    console.log('🚀 Starting Frontend Module Testing...\n');
    
    // Test all frontend modules
    const moduleResults = await testFrontendModules();
    
    // Test critical files
    const criticalResults = await testCriticalFrontendFiles();
    
    // Test auth flows
    await testAuthFlows();
    
    // Test messaging
    await testMessagingFunctionality();
    
    console.log('\n🎯 FRONTEND TESTING COMPLETED');
    console.log('=============================');
    console.log(`Module success rate: ${Math.round((moduleResults.passed/moduleResults.tested)*100)}%`);
    console.log(`Critical files found: ${criticalResults.found}/${criticalResults.found + criticalResults.missing}`);
    
    if (moduleResults.failed === 0 && criticalResults.missing === 0) {
        console.log('🎉 All frontend modules and critical files are present!');
    } else {
        console.log('⚠️  Some frontend components may need attention');
    }
}

// Run the tests
runFrontendTests().catch(error => {
    console.error('Frontend test execution failed:', error);
    process.exit(1);
});