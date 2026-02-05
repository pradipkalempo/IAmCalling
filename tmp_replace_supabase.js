const fs = require('fs');
const path = require('path');
const root = path.join('iamcalling', 'public');
const url = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
const repUrl = "window.APP_CONFIG?.supabaseUrl || ''";
const repKey = "window.APP_CONFIG?.supabaseAnonKey || ''";
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patternUrl = new RegExp('[\\\"\\\']' + escape(url) + '[\\\"\\\']', 'g');
const patternKey = new RegExp('[\\\"\\\']' + escape(key) + '[\\\"\\\']', 'g');
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(html|js)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const next = content.replace(patternUrl, repUrl).replace(patternKey, repKey);
      if (next !== content) fs.writeFileSync(full, next, 'utf8');
    }
  }
};
walk(root);