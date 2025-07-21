const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to the dist/index.html file
    const filePath = path.join(__dirname, 'dist', 'index.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for content to load dynamically
    try {
        await page.waitForSelector('.question-container', { timeout: 10000 });
        console.log('Content loaded successfully');
    } catch (e) {
        console.log('Warning: Question containers not found, checking for loading state...');
        
        // Check if there's a loading state
        const loadingState = await page.$('.loading-state');
        if (loadingState) {
            console.log('Page is in loading state');
        }
        
        // Check console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Console error:', msg.text());
            }
        });
    }
    
    // Additional wait for dynamic content
    await page.waitForTimeout(3000);
    
    // Find all technical questions (Q1-Q18)
    const questions = await page.evaluate(() => {
        const questionElements = document.querySelectorAll('.question-container h3');
        const results = [];
        
        questionElements.forEach((element) => {
            const text = element.textContent;
            const innerHTML = element.innerHTML;
            const questionNumber = text.match(/Q\d+/)?.[0];
            
            if (questionNumber) {
                results.push({
                    questionNumber,
                    fullText: text,
                    innerHTML: innerHTML,
                    hasDoubleQuotes: text.includes('""') || (text.match(/"/g) || []).length > 2
                });
            }
        });
        
        return results;
    });
    
    console.log('=== Technical Questions Display Analysis ===\n');
    console.log(`Total questions found: ${questions.length}\n`);
    
    // Check for double quotes issue
    const questionsWithDoubleQuotes = questions.filter(q => q.hasDoubleQuotes);
    
    if (questionsWithDoubleQuotes.length > 0) {
        console.log('⚠️  Questions with potential double quotes issue:');
        questionsWithDoubleQuotes.forEach(q => {
            console.log(`  - ${q.questionNumber}: ${q.fullText}`);
        });
    } else {
        console.log('✅ No double quotes issue detected');
    }
    
    // Display first 5 questions for verification
    console.log('\nFirst 5 questions:');
    questions.slice(0, 5).forEach(q => {
        console.log(`\n${q.questionNumber}:`);
        console.log(`  Text: ${q.fullText}`);
        console.log(`  HTML: ${q.innerHTML}`);
    });
    
    // Check the markdown parser in action
    const markdownParserTest = await page.evaluate(() => {
        // Check if the parser is available
        if (typeof window.MarkdownStructureParser !== 'undefined') {
            const parser = new window.MarkdownStructureParser();
            const testQuestion = '### Q1: "How do you manage different environments?"';
            const match = testQuestion.match(/^### (Q\d+): "(.+)"$/);
            
            return {
                parserAvailable: true,
                testInput: testQuestion,
                regexMatch: match ? {
                    fullMatch: match[0],
                    questionNumber: match[1],
                    questionTitle: match[2]
                } : null
            };
        }
        return { parserAvailable: false };
    });
    
    console.log('\n=== Markdown Parser Analysis ===');
    if (markdownParserTest.parserAvailable) {
        console.log('Parser is available');
        if (markdownParserTest.regexMatch) {
            console.log(`Test regex match:`);
            console.log(`  Question number: ${markdownParserTest.regexMatch.questionNumber}`);
            console.log(`  Question title: "${markdownParserTest.regexMatch.questionTitle}"`);
            console.log(`  Note: Title captured WITHOUT quotes, but template adds them back`);
        }
    }
    
    // Take a screenshot of the technical questions section
    const technicalSection = await page.$('#technical-devops-questions');
    if (technicalSection) {
        await technicalSection.screenshot({ 
            path: 'technical-questions-screenshot.png',
            fullPage: false 
        });
        console.log('\n✅ Screenshot saved as technical-questions-screenshot.png');
    }
    
    await browser.close();
    
    // Write report
    const report = {
        timestamp: new Date().toISOString(),
        totalQuestions: questions.length,
        questionsWithDoubleQuotes: questionsWithDoubleQuotes.length,
        sampleQuestions: questions.slice(0, 5),
        markdownParserAnalysis: markdownParserTest
    };
    
    fs.writeFileSync('question-display-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ Full report saved to question-display-report.json');
})();