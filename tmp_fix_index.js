const fs = require('fs');
const path = 'iamcalling/public/01-index.html';
const content = fs.readFileSync(path, 'utf8');
const marker = '<head>';
const first = content.indexOf(marker);
if (first === -1) throw new Error('No <head> found');
const second = content.indexOf(marker, first + marker.length);
if (second === -1) {
  // already single doc
  fs.writeFileSync(path, content, 'utf8');
  process.exit(0);
}
const cleaned = content.slice(0, second);
fs.writeFileSync(path, cleaned, 'utf8');