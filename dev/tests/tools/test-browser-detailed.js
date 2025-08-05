const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Enable detailed console logging
    page.on('console', msg => {
        console.log(`CONSOLE [${msg.type()}]:`, msg.text());
        if (msg.type() === 'error') {
            console.log('Stack trace:', msg.location());
        }
    });
    
    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.toString());
        console.log('Stack:', err.stack);
    });
    
    console.log('Loading page...');
    await page.goto('file:///var/projects/interview_prep/index.html');
    
    // Try to run the renderer manually
    const result = await page.evaluate(() => {
        try {
            // Check if UltimateContentRenderer exists
            if (typeof UltimateContentRenderer === 'undefined') {
                return 'UltimateContentRenderer is not defined';
            }
            
            // Try to create an instance
            const renderer = new UltimateContentRenderer();
            return 'Renderer created successfully';
        } catch (e) {
            return 'Error: ' + e.toString() + '\nStack: ' + e.stack;
        }
    });
    
    console.log('Manual renderer test:', result);
    
    await page.waitForTimeout(2000);
    await browser.close();
})();