// Non-Functional Test Report Generator
import fs from 'fs';
import path from 'path';

class NonFunctionalTestReport {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      performance: {
        loadTesting: { passed: 0, failed: 0, details: [] },
        stressTesting: { passed: 0, failed: 0, details: [] },
        scalability: { passed: 0, failed: 0, details: [] }
      },
      security: {
        authentication: { passed: 0, failed: 0, details: [] },
        dataProtection: { passed: 0, failed: 0, details: [] },
        inputValidation: { passed: 0, failed: 0, details: [] },
        apiSecurity: { passed: 0, failed: 0, details: [] }
      },
      compatibility: {
        crossBrowser: { passed: 0, failed: 0, details: [] },
        mobileDesktop: { passed: 0, failed: 0, details: [] },
        accessibility: { passed: 0, failed: 0, details: [] },
        usability: { passed: 0, failed: 0, details: [] }
      },
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        passRate: 0
      }
    };
  }

  addTestResult(category, subcategory, testName, passed, details = '') {
    const testEntry = {
      name: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString()
    };

    this.report[category][subcategory].details.push(testEntry);
    
    if (passed) {
      this.report[category][subcategory].passed++;
      this.report.summary.passedTests++;
    } else {
      this.report[category][subcategory].failed++;
      this.report.summary.failedTests++;
    }
    
    this.report.summary.totalTests++;
    this.report.summary.passRate = Math.round(
      (this.report.summary.passedTests / this.report.summary.totalTests) * 100
    );
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Non-Functional Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .category { background-color: white; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .category-header { padding: 15px; background-color: #3498db; color: white; border-radius: 5px 5px 0 0; }
        .subcategory { margin: 15px; padding: 15px; border: 1px solid #eee; border-radius: 5px; }
        .subcategory-header { font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
        .test-result { padding: 8px; margin: 5px 0; border-radius: 3px; }
        .passed { background-color: #d4edda; border-left: 4px solid #28a745; }
        .failed { background-color: #f8d7da; border-left: 4px solid #dc3545; }
        .stats { display: flex; justify-content: space-around; text-align: center; margin: 20px 0; }
        .stat-box { background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; }
        .passed-stat { color: #28a745; }
        .failed-stat { color: #dc3545; }
        .rate-stat { color: #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Non-Functional Test Report</h1>
        <p>Generated: ${this.report.timestamp}</p>
    </div>

    <div class="stats">
        <div class="stat-box">
            <div class="stat-number">${this.report.summary.totalTests}</div>
            <div>Total Tests</div>
        </div>
        <div class="stat-box">
            <div class="stat-number passed-stat">${this.report.summary.passedTests}</div>
            <div>Passed</div>
        </div>
        <div class="stat-box">
            <div class="stat-number failed-stat">${this.report.summary.failedTests}</div>
            <div>Failed</div>
        </div>
        <div class="stat-box">
            <div class="stat-number rate-stat">${this.report.summary.passRate}%</div>
            <div>Pass Rate</div>
        </div>
    </div>

    <div class="category">
        <div class="category-header">
            <h2>Performance Testing</h2>
        </div>
        ${this.generateCategoryHTML('performance')}
    </div>

    <div class="category">
        <div class="category-header">
            <h2>Security Testing</h2>
        </div>
        ${this.generateCategoryHTML('security')}
    </div>

    <div class="category">
        <div class="category-header">
            <h2>Compatibility & Usability Testing</h2>
        </div>
        ${this.generateCategoryHTML('compatibility')}
    </div>
</body>
</html>`;
    
    return html;
  }

  generateCategoryHTML(category) {
    let html = '';
    const cat = this.report[category];
    
    for (const [subcatName, subcatData] of Object.entries(cat)) {
      html += `
      <div class="subcategory">
        <div class="subcategory-header">${this.formatSubcategoryName(subcatName)} 
          (${subcatData.passed}/${subcatData.passed + subcatData.failed} passed)
        </div>`;
      
      for (const test of subcatData.details) {
        html += `
        <div class="test-result ${test.passed ? 'passed' : 'failed'}">
          <strong>${test.name}</strong>: ${test.passed ? 'PASSED' : 'FAILED'}
          ${test.details ? `<br><small>${test.details}</small>` : ''}
        </div>`;
      }
      
      html += '</div>';
    }
    
    return html;
  }

  formatSubcategoryName(name) {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  saveReport() {
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const htmlReport = this.generateHTMLReport();
    const htmlPath = path.join(reportDir, 'non_functional_test_report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    
    const jsonPath = path.join(reportDir, 'non_functional_test_report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));
    
    console.log(`Reports saved to ${reportDir}`);
    return { htmlPath, jsonPath };
  }
}

export default NonFunctionalTestReport;