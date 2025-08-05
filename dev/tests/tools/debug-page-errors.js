const { chromium } = require('playwright');

async function debugPageErrors() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  await page.goto('file:///var/projects/interview_prep/index.html');
  
  // Wait a bit to see if content loads
  await page.waitForTimeout(3000);
  
  // Check if content container has anything
  const content = await page.evaluate(() => {
    const container = document.getElementById('contentContainer');
    return {
      innerHTML: container ? container.innerHTML.substring(0, 200) : 'No container',
      childCount: container ? container.children.length : 0
    };
  });
  
  console.log('\nContent container:', content);
  
  // Check for code blocks
  const codeBlocks = await page.locator('pre code').count();
  console.log('\nCode blocks found:', codeBlocks);
  
  await browser.close();
}

debugPageErrors().catch(console.error);