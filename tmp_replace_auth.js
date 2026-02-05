const fs = require('fs');
const files = [
  'iamcalling/public/01-response-index.html',
  'iamcalling/public/22-write_article.html',
  'iamcalling/public/live-debug.html'
];
const authRegex = /'Authorization'\s*:\s*'Bearer [^']*'/g;
const replacement = "'Authorization': `Bearer ${window.APP_CONFIG?.supabaseAnonKey || ''}`";
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const next = content.replace(authRegex, replacement);
  if (next !== content) fs.writeFileSync(file, next, 'utf8');
}