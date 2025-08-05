const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Testing interactive features...');
  
  try {
    await page.goto('http://localhost:8082/interview-prep-dynamic.html');
    await page.waitForTimeout(2000);
    
    // Test 1: Search
    await page.fill('#searchInput', 'TypeScript');
    await page.waitForTimeout(500);
    const visibleQuestions = await page.locator('.question-item:visible').count();
    console.log(`✅ Search "TypeScript": ${visibleQuestions} results`);
    
    // Test 2: Category filter
    await page.click('.filter-tag:has-text("Core Concepts")');
    await page.waitForTimeout(500);
    const coreConceptsCount = await page.locator('.question-item:visible').count();
    console.log(`✅ Filter "Core Concepts": ${coreConceptsCount} results`);
    
    // Test 3: Dark mode
    await page.click('#themeToggle');
    const theme = await page.getAttribute('html', 'data-theme');
    console.log(`✅ Theme switched to: ${theme}`);
    
    // Test 4: Expand content
    await page.click('.filter-tag:has-text("All")'); // Reset filter
    await page.waitForTimeout(500);
    const expandBtn = page.locator('.action-btn').filter({ hasText: '📖' }).first();
    await expandBtn.click();
    const expanded = await page.locator('.question-content.expanded').count();
    console.log(`✅ Expanded content: ${expanded > 0}`);
    
    // Test 5: Mark completed
    const completeBtn = page.locator('.action-btn').filter({ hasText: '✅' }).first();
    await completeBtn.click();
    const progress = await page.textContent('#progressText');
    console.log(`✅ Progress updated: ${progress}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'interview-prep-features.png' });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
})();