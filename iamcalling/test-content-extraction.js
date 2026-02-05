// Test content extraction from admin posts
const testContent = `<div class="admin-code-executable" style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
<h1>Hello World</h1>
<p>This is a test post with HTML content</p>
<script>console.log("Test script running");</script>
</div>`;

console.log('Original content:');
console.log(testContent);
console.log('\n--- Testing regex patterns ---\n');

// Current regex from the article detail page
const currentRegex = /<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/i;
console.log('Current regex pattern:', currentRegex.toString());

const currentMatch = testContent.match(currentRegex);
console.log('Current regex match result:', currentMatch ? 'MATCH FOUND' : 'NO MATCH');
if (currentMatch) {
    console.log('Extracted content (current):', currentMatch[1]);
}

console.log('\n--- Testing alternative patterns ---\n');

// Alternative regex patterns
const patterns = [
    /<div[^>]*class=["'][^"']*admin-code-executable[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div\s+class\s*=\s*["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*\bclass\s*=\s*["'][^"']*admin-code-executable[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
];

patterns.forEach((pattern, index) => {
    console.log(`Pattern ${index + 1}: ${pattern.toString()}`);
    const match = testContent.match(pattern);
    console.log(`Match result: ${match ? 'MATCH FOUND' : 'NO MATCH'}`);
    if (match) {
        console.log(`Extracted content: ${match[1]}`);
    }
    console.log('---');
});