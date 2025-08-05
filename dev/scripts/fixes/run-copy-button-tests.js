#!/usr/bin/env node

/**
 * Test runner for copy button functionality
 * Can be run with Puppeteer, Playwright, or similar tools
 */

const runCopyButtonTests = async (page) => {
    console.log('Running copy button tests...\n');

    // Navigate to test page
    await page.goto('file://' + __dirname + '/test-copy-buttons.html', {
        waitUntil: 'networkidle2'
    });

    // Wait for tests to complete
    const results = await page.evaluate(() => {
        return new Promise((resolve) => {
            // Check if tests already completed
            if (window.copyButtonTestResults) {
                resolve(window.copyButtonTestResults);
            } else {
                // Wait for test completion event
                window.addEventListener('copyButtonTestsComplete', (event) => {
                    resolve(event.detail);
                });
            }

            // Timeout after 10 seconds
            setTimeout(() => {
                resolve({
                    total: 0,
                    passed: 0,
                    failed: 0,
                    errors: [{ test: 'Timeout', error: 'Tests did not complete within 10 seconds' }]
                });
            }, 10000);
        });
    });

    // Additional specific tests
    console.log('Running additional automated tests...\n');

    // Test 1: Verify copy buttons exist
    const copyButtonCount = await page.evaluate(() => {
        return document.querySelectorAll('.copy-code-btn').length;
    });
    console.log(`Found ${copyButtonCount} copy buttons on the page`);

    // Test 2: Test copy functionality
    const copyTestResult = await page.evaluate(async () => {
        const buttons = document.querySelectorAll('.copy-code-btn');
        if (buttons.length === 0) return { success: false, error: 'No copy buttons found' };

        try {
            // Click the first button
            buttons[0].click();
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if button changed state
            const hasSuccessIndicator = buttons[0].innerHTML.includes('bi-check') || 
                                       buttons[0].classList.contains('btn-success');
            
            return { success: hasSuccessIndicator };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    if (copyTestResult.success) {
        console.log('✓ Copy button click functionality works');
    } else {
        console.log('✗ Copy button click test failed:', copyTestResult.error);
    }

    // Test 3: Test dynamic content handling
    const dynamicTestResult = await page.evaluate(async () => {
        // Add a new code block
        const newPre = document.createElement('pre');
        const newCode = document.createElement('code');
        newCode.className = 'language-javascript';
        newCode.textContent = '// Dynamically added in test\nconst test = true;';
        newPre.appendChild(newCode);
        document.body.appendChild(newPre);

        // Trigger Prism
        if (typeof Prism !== 'undefined') {
            Prism.highlightElement(newCode);
        }

        // Wait for button
        await new Promise(resolve => setTimeout(resolve, 500));

        const button = newPre.querySelector('.copy-code-btn');
        return { success: !!button };
    });

    if (dynamicTestResult.success) {
        console.log('✓ Dynamic content handling works');
    } else {
        console.log('✗ Dynamic content test failed');
    }

    // Test 4: Performance test
    const performanceResult = await page.evaluate(async () => {
        const startTime = performance.now();
        
        // Add 10 code blocks at once
        const container = document.createElement('div');
        for (let i = 0; i < 10; i++) {
            container.innerHTML += `<pre><code class="language-js">// Code block ${i}\nconsole.log(${i});</code></pre>`;
        }
        document.body.appendChild(container);
        
        // Highlight all
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
        
        // Wait for buttons
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const buttons = container.querySelectorAll('.copy-code-btn');
        const endTime = performance.now();
        
        return {
            success: buttons.length === 10,
            time: endTime - startTime,
            buttonCount: buttons.length
        };
    });

    if (performanceResult.success) {
        console.log(`✓ Performance test passed: ${performanceResult.buttonCount} buttons added in ${performanceResult.time.toFixed(2)}ms`);
    } else {
        console.log(`✗ Performance test failed: Expected 10 buttons, found ${performanceResult.buttonCount}`);
    }

    // Summary
    console.log('\n========== FINAL RESULTS ==========');
    console.log(`Total tests: ${results.total + 4}`);
    console.log(`Passed: ${results.passed + (copyTestResult.success ? 1 : 0) + (dynamicTestResult.success ? 1 : 0) + (performanceResult.success ? 1 : 0)}`);
    console.log(`Failed: ${results.failed + (copyTestResult.success ? 0 : 1) + (dynamicTestResult.success ? 0 : 1) + (performanceResult.success ? 0 : 1)}`);

    return results;
};

// Export for use in test frameworks
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runCopyButtonTests };
}

// Example usage with Puppeteer (commented out)
/*
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await runCopyButtonTests(page);
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
})();
*/