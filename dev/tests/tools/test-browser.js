const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));
    
    await page.goto('file:///var/projects/interview_prep/index.html');
    
    // Wait for potential content to load
    await page.waitForTimeout(3000);
    
    // Check what's in the content container
    const contentContainer = await page.$eval('#contentContainer', el => el.innerHTML);
    console.log('Content Container HTML:', contentContainer.substring(0, 500));
    
    // Check if markdown was loaded
    const markdownLoaded = await page.evaluate(() => {
        const markdownElement = document.getElementById('markdownContent');
        return markdownElement ? markdownElement.textContent.substring(0, 200) : 'NOT FOUND';
    });
    console.log('Markdown Content:', markdownLoaded);
    
    // Check for any errors
    await page.waitForTimeout(2000);
    
    await browser.close();
})();