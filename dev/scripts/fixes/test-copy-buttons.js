// Automated test for copy button functionality
// This can be run in a headless browser or testing framework

async function testCopyButtons() {
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
    };

    console.log('Starting copy button tests...\n');

    // Test 1: Check if copy button handler is loaded
    results.total++;
    try {
        if (window.copyButtonHandler && typeof window.copyButtonHandler.init === 'function') {
            console.log('✓ Copy button handler loaded successfully');
            results.passed++;
        } else {
            throw new Error('Copy button handler not found or invalid');
        }
    } catch (error) {
        console.error('✗ Test 1 failed:', error.message);
        results.failed++;
        results.errors.push({ test: 'Handler loading', error: error.message });
    }

    // Test 2: Check if buttons are added to existing code blocks
    results.total++;
    try {
        // Create a test code block
        const testPre = document.createElement('pre');
        const testCode = document.createElement('code');
        testCode.className = 'language-javascript';
        testCode.textContent = 'console.log("test");';
        testPre.appendChild(testCode);
        document.body.appendChild(testPre);

        // Trigger Prism highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightElement(testCode);
        }

        // Wait for button to be added
        await new Promise(resolve => setTimeout(resolve, 200));

        const button = testPre.querySelector('.copy-code-btn');
        if (button) {
            console.log('✓ Copy button added to code block');
            results.passed++;
        } else {
            throw new Error('Copy button not found after 200ms');
        }

        // Cleanup
        testPre.remove();
    } catch (error) {
        console.error('✗ Test 2 failed:', error.message);
        results.failed++;
        results.errors.push({ test: 'Button addition', error: error.message });
    }

    // Test 3: Check if mutation observer works for dynamic content
    results.total++;
    try {
        const container = document.createElement('div');
        document.body.appendChild(container);

        // Add code block dynamically
        setTimeout(() => {
            container.innerHTML = '<pre><code class="language-js">dynamic code</code></pre>';
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        }, 100);

        // Wait and check
        await new Promise(resolve => setTimeout(resolve, 500));

        const dynamicButton = container.querySelector('.copy-code-btn');
        if (dynamicButton) {
            console.log('✓ Copy button added to dynamically inserted code block');
            results.passed++;
        } else {
            throw new Error('Copy button not found on dynamic content');
        }

        // Cleanup
        container.remove();
    } catch (error) {
        console.error('✗ Test 3 failed:', error.message);
        results.failed++;
        results.errors.push({ test: 'Dynamic content', error: error.message });
    }

    // Test 4: Check copy functionality
    results.total++;
    try {
        // Create a code block with known content
        const testPre = document.createElement('pre');
        const testCode = document.createElement('code');
        testCode.textContent = 'TEST_COPY_CONTENT_12345';
        testPre.appendChild(testCode);
        document.body.appendChild(testPre);

        // Process the element
        window.copyButtonHandler.processPreElement(testPre);
        await new Promise(resolve => setTimeout(resolve, 100));

        const button = testPre.querySelector('.copy-code-btn');
        if (!button) {
            throw new Error('No copy button found');
        }

        // Test the copy functionality
        // Note: In automated tests, clipboard API might not be available
        // so we test the fallback method
        const copySuccess = await testCopyFunctionality(button, testPre);
        
        if (copySuccess) {
            console.log('✓ Copy functionality works');
            results.passed++;
        } else {
            throw new Error('Copy functionality failed');
        }

        // Cleanup
        testPre.remove();
    } catch (error) {
        console.error('✗ Test 4 failed:', error.message);
        results.failed++;
        results.errors.push({ test: 'Copy functionality', error: error.message });
    }

    // Test 5: Check for duplicate buttons
    results.total++;
    try {
        const testPre = document.createElement('pre');
        const testCode = document.createElement('code');
        testCode.textContent = 'test duplicate';
        testPre.appendChild(testCode);
        document.body.appendChild(testPre);

        // Process multiple times
        window.copyButtonHandler.processPreElement(testPre);
        await new Promise(resolve => setTimeout(resolve, 50));
        window.copyButtonHandler.processPreElement(testPre);
        await new Promise(resolve => setTimeout(resolve, 50));
        window.copyButtonHandler.processPreElement(testPre);
        await new Promise(resolve => setTimeout(resolve, 50));

        const buttons = testPre.querySelectorAll('.copy-code-btn');
        if (buttons.length === 1) {
            console.log('✓ No duplicate buttons created');
            results.passed++;
        } else {
            throw new Error(`Found ${buttons.length} buttons instead of 1`);
        }

        // Cleanup
        testPre.remove();
    } catch (error) {
        console.error('✗ Test 5 failed:', error.message);
        results.failed++;
        results.errors.push({ test: 'Duplicate prevention', error: error.message });
    }

    // Print summary
    console.log('\n========== TEST SUMMARY ==========');
    console.log(`Total tests: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => {
            console.log(`- ${err.test}: ${err.error}`);
        });
    }

    return results;
}

async function testCopyFunctionality(button, pre) {
    try {
        // Simulate button click
        button.click();
        
        // Check if button shows success state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const hasCheckIcon = button.innerHTML.includes('bi-check');
        const hasSuccessClass = button.classList.contains('btn-success');
        
        return hasCheckIcon || hasSuccessClass;
    } catch (error) {
        console.error('Copy test error:', error);
        return false;
    }
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined' && window.location.href.includes('test')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            testCopyButtons().then(results => {
                // Store results globally for test frameworks
                window.copyButtonTestResults = results;
                
                // Dispatch custom event for test frameworks
                window.dispatchEvent(new CustomEvent('copyButtonTestsComplete', { 
                    detail: results 
                }));
            });
        }, 1000);
    });
}