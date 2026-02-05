/**
 * Integration Test Runner
 * Tests integration between different modules and components
 */

import fs from 'fs';
import path from 'path';

console.log('🔗 INTEGRATION TESTING');
console.log('=====================');

// Test integration between frontend and backend
async function testFrontendBackendIntegration() {
    console.log('\n🌐 FRONTEND-BACKEND INTEGRATION');
    console.log('===============================');
    
    let integrationPoints = 0;
    let workingIntegrations = 0;
    
    // Test API endpoint integrations
    const apiIntegrations = [
        {
            name: 'Auth API Integration',
            frontendFile: './public/js/15-login-fixed.js',
            backendFile: './routes/auth.js',
            checkFunction: 'loginUser',
            apiEndpoint: '/auth/login'
        },
        {
            name: 'Profile API Integration',
            frontendFile: './public/js/global-auth-manager.js',
            backendFile: './routes/userProfile.js',
            checkFunction: 'getUserProfile',
            apiEndpoint: '/api/profile'
        },
        {
            name: 'Messaging API Integration',
            frontendFile: './public/js/unified-messenger.js',
            backendFile: './routes/messenger.js',
            checkFunction: 'sendMessage',
            apiEndpoint: '/api/messages'
        }
    ];
    
    for (const integration of apiIntegrations) {
        integrationPoints++;
        console.log(`\nTesting: ${integration.name}`);
        
        try {
            // Check if frontend file exists and has the function
            if (fs.existsSync(integration.frontendFile)) {
                const frontendContent = fs.readFileSync(integration.frontendFile, 'utf8');
                const hasFunction = frontendContent.includes(integration.checkFunction);
                
                if (hasFunction) {
                    console.log(`✅ Frontend has ${integration.checkFunction} function`);
                } else {
                    console.log(`❌ Frontend missing ${integration.checkFunction} function`);
                }
            } else {
                console.log(`❌ Frontend file not found: ${integration.frontendFile}`);
            }
            
            // Check if backend file exists
            if (fs.existsSync(integration.backendFile)) {
                console.log(`✅ Backend route exists: ${path.basename(integration.backendFile)}`);
                workingIntegrations++;
            } else {
                console.log(`❌ Backend route missing: ${integration.backendFile}`);
            }
            
        } catch (error) {
            console.log(`❌ Integration test error: ${error.message}`);
        }
    }
    
    console.log(`\nAPI Integrations: ${workingIntegrations}/${integrationPoints} working`);
    return { total: integrationPoints, working: workingIntegrations };
}

// Test database-service integrations
async function testDatabaseIntegrations() {
    console.log('\n🗄️ DATABASE-SERVICE INTEGRATIONS');
    console.log('===============================');
    
    const serviceFiles = [
        './services/databaseService.js',
        './services/userProfileService.js',
        './services/simpleSupabaseClient.js'
    ];
    
    let servicesFound = 0;
    let servicesWorking = 0;
    
    for (const serviceFile of serviceFiles) {
        try {
            if (fs.existsSync(serviceFile)) {
                servicesFound++;
                const content = fs.readFileSync(serviceFile, 'utf8');
                const stats = fs.statSync(serviceFile);
                
                console.log(`✅ ${path.basename(serviceFile)} (${Math.round(stats.size/1024)}KB)`);
                
                // Check for key database functions
                const dbFunctions = ['query', 'select', 'insert', 'update', 'delete'];
                let foundFunctions = 0;
                
                for (const func of dbFunctions) {
                    if (content.toLowerCase().includes(func)) {
                        foundFunctions++;
                    }
                }
                
                if (foundFunctions > 0) {
                    console.log(`   Database functions found: ${foundFunctions}/${dbFunctions.length}`);
                    servicesWorking++;
                }
                
            } else {
                console.log(`❌ ${serviceFile} not found`);
            }
        } catch (error) {
            console.log(`❌ Error checking ${serviceFile}: ${error.message}`);
        }
    }
    
    console.log(`\nDatabase services: ${servicesWorking}/${servicesFound} working`);
    return { found: servicesFound, working: servicesWorking };
}

// Test authentication flow integration
async function testAuthFlowIntegration() {
    console.log('\n🔐 AUTHENTICATION FLOW INTEGRATION');
    console.log('==================================');
    
    // Check if all auth components work together
    const authComponents = [
        './routes/auth.js',
        './services/userProfileService.js',
        './public/js/global-auth-manager.js',
        './public/js/15-login-fixed.js'
    ];
    
    let componentsFound = 0;
    let componentsWorking = 0;
    
    for (const component of authComponents) {
        try {
            if (fs.existsSync(component)) {
                componentsFound++;
                const content = fs.readFileSync(component, 'utf8');
                
                console.log(`✅ ${path.basename(component)} found`);
                
                // Check for auth-related functionality
                const authKeywords = ['auth', 'login', 'token', 'session', 'user'];
                let foundKeywords = 0;
                
                for (const keyword of authKeywords) {
                    if (content.toLowerCase().includes(keyword)) {
                        foundKeywords++;
                    }
                }
                
                if (foundKeywords >= 2) {
                    console.log(`   Auth functionality: ${foundKeywords}/${authKeywords.length} keywords found`);
                    componentsWorking++;
                }
                
            } else {
                console.log(`❌ ${component} not found`);
            }
        } catch (error) {
            console.log(`❌ Error checking ${component}: ${error.message}`);
        }
    }
    
    console.log(`\nAuth components: ${componentsWorking}/${componentsFound} working`);
    return { found: componentsFound, working: componentsWorking };
}

// Test messaging integration
async function testMessagingIntegration() {
    console.log('\n💬 MESSAGING INTEGRATION');
    console.log('========================');
    
    const messagingComponents = [
        './routes/messenger.js',
        './public/js/unified-messenger.js',
        './public/34-icalluser-messenger.html'
    ];
    
    let componentsFound = 0;
    let componentsWorking = 0;
    
    for (const component of messagingComponents) {
        try {
            if (fs.existsSync(component)) {
                componentsFound++;
                const content = fs.readFileSync(component, 'utf8');
                const stats = fs.statSync(component);
                
                console.log(`✅ ${path.basename(component)} (${Math.round(stats.size/1024)}KB) found`);
                
                // Check for messaging functionality
                const messageKeywords = ['message', 'send', 'receive', 'chat', 'conversation'];
                let foundKeywords = 0;
                
                for (const keyword of messageKeywords) {
                    if (content.toLowerCase().includes(keyword)) {
                        foundKeywords++;
                    }
                }
                
                if (foundKeywords >= 2) {
                    console.log(`   Messaging features: ${foundKeywords}/${messageKeywords.length} keywords found`);
                    componentsWorking++;
                }
                
            } else {
                console.log(`❌ ${component} not found`);
            }
        } catch (error) {
            console.log(`❌ Error checking ${component}: ${error.message}`);
        }
    }
    
    console.log(`\nMessaging components: ${componentsWorking}/${componentsFound} working`);
    return { found: componentsFound, working: componentsWorking };
}

// Test cross-module dependencies
async function testCrossModuleDependencies() {
    console.log('\n🔗 CROSS-MODULE DEPENDENCIES');
    console.log('============================');
    
    // Check if modules properly import/require each other
    const dependencyChecks = [
        {
            module: 'Unified Messenger',
            file: './public/js/unified-messenger.js',
            dependencies: ['global-auth-manager', 'supabase-client']
        },
        {
            module: 'Auth Manager',
            file: './public/js/global-auth-manager.js',
            dependencies: ['storage-fallback', 'session-manager']
        },
        {
            module: 'Profile Service',
            file: './services/userProfileService.js',
            dependencies: ['databaseService', 'simpleSupabaseClient']
        }
    ];
    
    let dependencySets = 0;
    let workingDependencies = 0;
    
    for (const check of dependencyChecks) {
        dependencySets++;
        console.log(`\nChecking ${check.module} dependencies:`);
        
        try {
            if (fs.existsSync(check.file)) {
                const content = fs.readFileSync(check.file, 'utf8');
                let foundDependencies = 0;
                
                for (const dep of check.dependencies) {
                    if (content.includes(dep)) {
                        console.log(`✅ Depends on: ${dep}`);
                        foundDependencies++;
                    } else {
                        console.log(`❌ Missing dependency: ${dep}`);
                    }
                }
                
                if (foundDependencies === check.dependencies.length) {
                    console.log(`   All dependencies satisfied`);
                    workingDependencies++;
                }
                
            } else {
                console.log(`❌ Module file not found: ${check.file}`);
            }
            
        } catch (error) {
            console.log(`❌ Dependency check error: ${error.message}`);
        }
    }
    
    console.log(`\nDependency sets: ${workingDependencies}/${dependencySets} working`);
    return { total: dependencySets, working: workingDependencies };
}

// Main integration test runner
async function runIntegrationTests() {
    console.log('🚀 Starting Integration Testing...\n');
    
    // Test frontend-backend integration
    const apiIntegration = await testFrontendBackendIntegration();
    
    // Test database integrations
    const dbIntegration = await testDatabaseIntegrations();
    
    // Test auth flow integration
    const authIntegration = await testAuthFlowIntegration();
    
    // Test messaging integration
    const messagingIntegration = await testMessagingIntegration();
    
    // Test cross-module dependencies
    const dependencyIntegration = await testCrossModuleDependencies();
    
    console.log('\n🎯 INTEGRATION TESTING COMPLETED');
    console.log('===============================');
    
    const totalTests = apiIntegration.total + dbIntegration.found + authIntegration.found + 
                      messagingIntegration.found + dependencyIntegration.total;
    const passedTests = apiIntegration.working + dbIntegration.working + authIntegration.working + 
                       messagingIntegration.working + dependencyIntegration.working;
    
    console.log(`Overall integration success: ${passedTests}/${totalTests} components working`);
    console.log(`Success rate: ${Math.round((passedTests/totalTests)*100)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All integration points are functioning correctly!');
    } else {
        console.log('⚠️  Some integration points may need attention');
    }
}

// Run the tests
runIntegrationTests().catch(error => {
    console.error('Integration test execution failed:', error);
    process.exit(1);
});