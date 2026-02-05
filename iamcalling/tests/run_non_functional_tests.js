#!/usr/bin/env node

// Non-Functional Test Runner
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import NonFunctionalTestReport from './non_functional_test_report.js';

class NonFunctionalTestRunner {
  constructor() {
    this.report = new NonFunctionalTestReport();
    this.testResults = [];
  }

  async runPerformanceTests() {
    console.log('🚀 Running Performance Tests...');
    
    // Run load tests
    await this.runTestSuite('performance:load', 'Load Testing');
    
    // Run stress tests
    await this.runTestSuite('performance:stress', 'Stress Testing');
    
    // Run scalability tests
    await this.runTestSuite('performance:scalability', 'Scalability Testing');
  }

  async runSecurityTests() {
    console.log('🔒 Running Security Tests...');
    
    // Run authentication security tests
    await this.runTestSuite('security:auth', 'Authentication Security');
    
    // Run comprehensive security tests
    await this.runTestSuite('security:comprehensive', 'Comprehensive Security');
  }

  async runCompatibilityTests() {
    console.log('🌐 Running Compatibility & Usability Tests...');
    
    // Run frontend compatibility tests
    await this.runTestSuite('test:frontend', 'Frontend Compatibility');
  }

  async runTestSuite(scriptName, testName) {
    return new Promise((resolve) => {
      console.log(`  Running ${testName}...`);
      
      const testProcess = spawn('npm', ['run', scriptName], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      testProcess.on('close', (code) => {
        const passed = code === 0;
        console.log(`  ${testName}: ${passed ? 'PASSED' : 'FAILED'} (exit code: ${code})`);
        
        this.report.addTestResult(
          this.getCategoryForTest(scriptName),
          this.getSubcategoryForTest(scriptName),
          testName,
          passed,
          `Exit code: ${code}\n${stderr.substring(0, 200)}`
        );
        
        resolve();
      });
    });
  }

  getCategoryForTest(scriptName) {
    if (scriptName.includes('performance')) return 'performance';
    if (scriptName.includes('security')) return 'security';
    if (scriptName.includes('frontend') || scriptName.includes('compatibility')) return 'compatibility';
    return 'other';
  }

  getSubcategoryForTest(scriptName) {
    if (scriptName.includes('load')) return 'loadTesting';
    if (scriptName.includes('stress')) return 'stressTesting';
    if (scriptName.includes('scalability')) return 'scalability';
    if (scriptName.includes('auth')) return 'authentication';
    if (scriptName.includes('comprehensive')) return 'comprehensive';
    if (scriptName.includes('frontend')) return 'crossBrowser';
    return 'general';
  }

  async runAllTests() {
    console.log('🧪 Starting Non-Functional Test Suite');
    console.log('=====================================');
    
    try {
      // Run each test category
      await this.runPerformanceTests();
      await this.runSecurityTests();
      await this.runCompatibilityTests();
      
      // Generate and save report
      const paths = this.report.saveReport();
      console.log('\n✅ All Non-Functional Tests Completed');
      console.log(`📊 Report generated at: ${paths.htmlPath}`);
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Error running tests:', error);
      process.exit(1);
    }
  }

  printSummary() {
    const summary = this.report.report.summary;
    console.log('\n📋 Test Summary:');
    console.log(`   Total Tests: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passedTests}`);
    console.log(`   Failed: ${summary.failedTests}`);
    console.log(`   Pass Rate: ${summary.passRate}%`);
    
    if (summary.failedTests > 0) {
      console.log('\n⚠️  Some tests failed. Please review the detailed report.');
    } else {
      console.log('\n🎉 All tests passed! System is ready for production.');
    }
  }
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new NonFunctionalTestRunner();
  runner.runAllTests().catch(console.error);
}

export default NonFunctionalTestRunner;