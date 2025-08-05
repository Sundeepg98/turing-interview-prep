const fs = require('fs');

// Read the test file
let testContent = fs.readFileSync('extreme-test.spec.js', 'utf-8');

// Find and replace the problematic line
const oldLine = '      const found = await page.locator(`code:has-text("${snippet}")`).count();';
const newLine = '      const found = await page.locator(\'code\').filter({ hasText: snippet }).count();';

testContent = testContent.replace(oldLine, newLine);

// Write the updated test
fs.writeFileSync('extreme-test.spec.js', testContent);
console.log('Fixed extreme test to use proper text filtering');