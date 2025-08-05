const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Testing interview-prep-dynamic.html...');
  
  try {
    await page.goto('http://localhost:8082/interview-prep-dynamic.html');
    console.log('✅ Page loaded');
    
    // Wait for content
    await page.waitForTimeout(2000);
    
    // Check if loading message is gone
    const loadingVisible = await page.locator('#loadingMessage').isVisible();
    console.log(`Loading message visible: ${loadingVisible}`);
    
    // Check for questions
    const questionCount = await page.locator('.question-item').count();
    console.log(`✅ Found ${questionCount} questions/sections`);
    
    // Check search box
    const searchBox = await page.locator('#searchInput').isVisible();
    console.log(`✅ Search box visible: ${searchBox}`);
    
    // Take screenshot
    await page.screenshot({ path: 'interview-prep-test.png' });
    console.log('✅ Screenshot saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
})();