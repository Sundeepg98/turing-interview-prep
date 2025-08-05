// Test script to verify all functionality
const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPage() {
    console.log('🚀 Starting page tests...');
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('❌ Console error:', msg.text());
        } else {
            console.log('📝', msg.text());
        }
    });
    
    page.on('pageerror', err => {
        console.error('❌ Page error:', err.message);
    });
    
    // Load the page
    await page.goto(`file://${__dirname}/index.html`, {
        waitUntil: 'networkidle0'
    });
    
    // Wait for content to render
    await page.waitForTimeout(2000);
    
    // Run tests
    const results = await page.evaluate(() => {
        const tests = {
            questionsRendered: 0,
            codeBlocksFound: 0,
            copyButtonsFound: 0,
            navigationItems: 0,
            starStoriesFound: 0,
            searchFunctional: false,
            darkModeToggleExists: false,
            contentVisible: false,
            markdownParsed: false
        };
        
        // Check questions
        tests.questionsRendered = document.querySelectorAll('.question-card').length;
        
        // Check code blocks
        tests.codeBlocksFound = document.querySelectorAll('pre code').length;
        
        // Check copy buttons
        tests.copyButtonsFound = document.querySelectorAll('.copy-code').length;
        
        // Check navigation
        tests.navigationItems = document.querySelectorAll('#sidebarNav .nav-link').length;
        
        // Check STAR stories
        tests.starStoriesFound = document.querySelectorAll('.star-story').length;
        
        // Check search functionality
        tests.searchFunctional = !!document.getElementById('searchBox');
        
        // Check dark mode toggle
        tests.darkModeToggleExists = !!document.getElementById('darkModeToggle');
        
        // Check content visibility
        const contentContainer = document.getElementById('contentContainer');
        tests.contentVisible = contentContainer && contentContainer.innerHTML.trim().length > 0;
        
        // Check if markdown was parsed (look for parsed headers)
        tests.markdownParsed = document.querySelectorAll('h2, h3, h4').length > 5;
        
        // Get question count display
        const questionCount = document.getElementById('questionCount');
        tests.questionCountDisplay = questionCount ? questionCount.textContent : '0';
        
        // Check for specific content
        tests.hasQuickReference = !!document.getElementById('quick-ref');
        tests.hasCommands = !!document.getElementById('commands');
        
        return tests;
    });
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`✅ Questions rendered: ${results.questionsRendered}/18`);
    console.log(`✅ Code blocks found: ${results.codeBlocksFound}`);
    console.log(`✅ Copy buttons found: ${results.copyButtonsFound}`);
    console.log(`✅ Navigation items: ${results.navigationItems}`);
    console.log(`✅ STAR stories: ${results.starStoriesFound}`);
    console.log(`✅ Search functional: ${results.searchFunctional}`);
    console.log(`✅ Dark mode toggle: ${results.darkModeToggleExists}`);
    console.log(`✅ Content visible: ${results.contentVisible}`);
    console.log(`✅ Markdown parsed: ${results.markdownParsed}`);
    console.log(`✅ Question count display: ${results.questionCountDisplay}`);
    console.log(`✅ Has Quick Reference: ${results.hasQuickReference}`);
    console.log(`✅ Has Commands section: ${results.hasCommands}`);
    
    // Test copy functionality
    console.log('\n🔧 Testing copy functionality...');
    const copyWorking = await page.evaluate(() => {
        const firstButton = document.querySelector('.copy-code');
        if (firstButton) {
            firstButton.click();
            return true;
        }
        return false;
    });
    console.log(`✅ Copy button clickable: ${copyWorking}`);
    
    // Test dark mode toggle
    console.log('\n🌙 Testing dark mode...');
    await page.click('#darkModeToggle');
    await page.waitForTimeout(500);
    
    const darkModeActive = await page.evaluate(() => {
        return document.body.getAttribute('data-theme') === 'dark';
    });
    console.log(`✅ Dark mode toggles: ${darkModeActive}`);
    
    // Test search
    console.log('\n🔍 Testing search...');
    await page.type('#searchBox', 'Pulumi');
    await page.waitForTimeout(500);
    
    const searchResults = await page.evaluate(() => {
        const highlights = document.querySelectorAll('mark.search-highlight');
        return highlights.length;
    });
    console.log(`✅ Search highlights found: ${searchResults}`);
    
    // Calculate success rate
    const totalTests = 15;
    const passedTests = [
        results.questionsRendered === 18,
        results.codeBlocksFound > 30,
        results.copyButtonsFound > 30,
        results.navigationItems > 18,
        results.starStoriesFound >= 3,
        results.searchFunctional,
        results.darkModeToggleExists,
        results.contentVisible,
        results.markdownParsed,
        results.hasQuickReference,
        results.hasCommands,
        copyWorking,
        darkModeActive,
        searchResults > 0,
        results.questionCountDisplay === '18'
    ].filter(Boolean).length;
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
    
    if (successRate === 100) {
        console.log('✨ All tests passed! Page is fully functional.');
    } else {
        console.log(`⚠️  ${totalTests - passedTests} tests failed. Some fixes needed.`);
    }
    
    // Take screenshots
    await page.screenshot({ path: 'dist/screenshot-light.png', fullPage: false });
    await page.click('#darkModeToggle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'dist/screenshot-dark.png', fullPage: false });
    
    await browser.close();
    
    return successRate;
}

// Run the test
testPage().then(successRate => {
    console.log('\n✅ Testing complete!');
    process.exit(successRate === 100 ? 0 : 1);
}).catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});