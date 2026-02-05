const http = require('http');

const testData = JSON.stringify({
    title: 'Test Post',
    content: 'This is a test post content',
    category: 'test'
});

const options = {
    hostname: 'localhost',
    port: 1000,
    path: '/api/admin/posts',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
    }
};

console.log('Testing admin post creation...');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
});

req.write(testData);
req.end();