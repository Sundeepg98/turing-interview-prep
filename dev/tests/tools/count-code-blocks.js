const fs = require('fs');
const content = fs.readFileSync('src/markdown/COMPLETE_TURING_INTERVIEW_GUIDE.md', 'utf-8');
const lines = content.split('\n');

let codeBlocks = 0;
let inBlock = false;
let blockStarts = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('```')) {
    if (!inBlock) {
      codeBlocks++;
      inBlock = true;
      blockStarts.push({ line: i + 1, lang: lines[i].substring(3) || 'none' });
    } else {
      inBlock = false;
    }
  }
}

console.log('Total code blocks found:', codeBlocks);
console.log('\nFirst 10 code blocks:');
blockStarts.slice(0, 10).forEach((block, idx) => {
  console.log(`${idx + 1}. Line ${block.line}: Language = ${block.lang}`);
});