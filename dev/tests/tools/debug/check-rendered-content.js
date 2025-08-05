const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('file:///var/projects/interview_prep/index.html');
    await page.waitForTimeout(2000); // Wait for content to load
    
    // Check what's in the content container after loading
    const contentHTML = await page.$eval('#contentContainer', el => el.innerHTML);
    console.log('Content length:', contentHTML.length);
    console.log('First 1000 chars:', contentHTML.substring(0, 1000));
    
    // Check for specific elements
    const h3Count = await page.locator('h3').count();
    const h4Count = await page.locator('h4').count();
    const codeCount = await page.locator('pre code').count();
    const questionCards = await page.locator('.question-card').count();
    
    console.log('\nElement counts:');
    console.log('H3 headers:', h3Count);
    console.log('H4 headers:', h4Count);
    console.log('Code blocks:', codeCount);
    console.log('Question cards:', questionCards);
    
    // Check for specific question text
    const q1Text = await page.locator('.question-card').first().textContent().catch(() => 'NOT FOUND');
    console.log('\nFirst question text:', q1Text.substring(0, 200));
    
    await browser.close();
})();