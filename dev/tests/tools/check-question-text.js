const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('file:///var/projects/interview_prep/index.html');
    await page.waitForTimeout(2000);
    
    // Find all h3 elements and print their text
    const h3Elements = await page.$$eval('h3', elements => 
        elements.map(el => el.textContent.trim())
    );
    
    console.log('All H3 elements:');
    h3Elements.forEach((text, i) => {
        console.log(`  ${i + 1}. "${text}"`);
    });
    
    // Check for the specific question
    const hasQ1 = await page.locator('text="How do you manage different environments?"').count();
    console.log('\nExact match for "How do you manage different environments?":', hasQ1);
    
    // Check partial matches
    const partialMatches = await page.locator('*:has-text("manage different environments")').count();
    console.log('Partial matches for "manage different environments":', partialMatches);
    
    await browser.close();
})();