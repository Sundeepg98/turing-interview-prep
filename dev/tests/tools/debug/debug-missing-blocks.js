const { chromium } = require('playwright');
const fs = require('fs').promises;

async function debugMissingBlocks() {
  // Read markdown
  const markdown = await fs.readFile('src/markdown/COMPLETE_TURING_INTERVIEW_GUIDE.md', 'utf-8');
  const lines = markdown.split('\n');
  
  // Extract all code blocks from markdown
  const markdownBlocks = [];
  let inBlock = false;
  let currentBlock = [];
  let blockStart = 0;
  let language = '';
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) {
      if (!inBlock) {
        inBlock = true;
        blockStart = i + 1;
        language = lines[i].substring(3).trim() || 'plaintext';
      } else {
        const content = currentBlock.join('\n').trim();
        if (content) {
          markdownBlocks.push({
            line: blockStart,
            language,
            content: content.substring(0, 50) + '...',
            fullContent: content
          });
        }
        currentBlock = [];
        inBlock = false;
      }
    } else if (inBlock) {
      currentBlock.push(lines[i]);
    }
  }
  
  console.log(`Found ${markdownBlocks.length} code blocks in markdown\n`);
  
  // Launch browser and check HTML
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///var/projects/interview_prep/index.html');
  await page.waitForLoadState('networkidle');
  
  // Get all code blocks from HTML
  const htmlBlocks = await page.evaluate(() => {
    const blocks = [];
    document.querySelectorAll('pre code').forEach((code, idx) => {
      blocks.push({
        index: idx,
        content: code.textContent.trim().substring(0, 50) + '...',
        fullContent: code.textContent.trim()
      });
    });
    return blocks;
  });
  
  console.log(`Found ${htmlBlocks.length} code blocks in HTML\n`);
  
  // Find missing blocks
  console.log('Checking which blocks are missing...\n');
  
  for (let i = 0; i < markdownBlocks.length; i++) {
    const mdBlock = markdownBlocks[i];
    const found = htmlBlocks.some(htmlBlock => 
      htmlBlock.fullContent.includes(mdBlock.fullContent.substring(0, 30))
    );
    
    if (!found) {
      console.log(`MISSING Block ${i + 1} (Line ${mdBlock.line}):`);
      console.log(`  Language: ${mdBlock.language}`);
      console.log(`  Content: ${mdBlock.content}`);
      console.log('');
    }
  }
  
  await browser.close();
}

debugMissingBlocks().catch(console.error);