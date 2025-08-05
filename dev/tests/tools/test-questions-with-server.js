const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

// Function to start the test server
function startServer() {
    return new Promise((resolve, reject) => {
        const server = spawn('node', ['test-server.js']);
        
        server.stdout.on('data', (data) => {
            console.log(`Server: ${data.toString().trim()}`);
            if (data.toString().includes('Test server running')) {
                resolve(server);
            }
        });
        
        server.stderr.on('data', (data) => {
            console.error(`Server error: ${data}`);
        });
        
        server.on('error', reject);
    });
}

(async () => {
    let server;
    
    try {
        // Start the test server
        console.log('Starting test server...');
        server = await startServer();
        
        // Wait a bit for server to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Launch browser
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Browser console error:', msg.text());
            }
        });
        
        // Navigate to the page
        console.log('\nNavigating to http://localhost:8080/index.html');
        await page.goto('http://localhost:8080/index.html');
        
        // Wait for content to load
        console.log('Waiting for content to load...');
        try {
            await page.waitForSelector('.question-container', { timeout: 15000 });
            console.log('✅ Question containers loaded');
        } catch (e) {
            console.log('⚠️  Question containers not found');
            
            // Check what's on the page
            const bodyText = await page.textContent('body');
            console.log('Page body preview:', bodyText.substring(0, 200) + '...');
        }
        
        // Analyze technical questions
        const analysis = await page.evaluate(() => {
            const results = {
                questions: [],
                totalQuestions: 0,
                questionsWithDoubleQuotes: 0,
                markdownParserInfo: null
            };
            
            // Find all question containers
            const questionElements = document.querySelectorAll('.question-container h3');
            
            questionElements.forEach((element) => {
                const text = element.textContent.trim();
                const innerHTML = element.innerHTML;
                const questionMatch = text.match(/^(Q\d+):\s*(.+)$/);
                
                if (questionMatch) {
                    const questionData = {
                        number: questionMatch[1],
                        fullText: text,
                        titlePart: questionMatch[2],
                        innerHTML: innerHTML,
                        quotesCount: (text.match(/"/g) || []).length,
                        hasDoubleQuotes: text.includes('""') || (text.match(/"/g) || []).length > 2
                    };
                    results.questions.push(questionData);
                }
            });
            
            results.totalQuestions = results.questions.length;
            results.questionsWithDoubleQuotes = results.questions.filter(q => q.hasDoubleQuotes).length;
            
            // Check if markdown parser is available
            if (typeof window.MarkdownStructureParser !== 'undefined') {
                const parser = new window.MarkdownStructureParser();
                const testInput = '### Q1: "How do you manage different environments?"';
                const match = testInput.match(/^### (Q\d+): "(.+)"$/);
                
                results.markdownParserInfo = {
                    available: true,
                    testRegexResult: match ? {
                        number: match[1],
                        title: match[2],
                        note: 'Title captured WITHOUT surrounding quotes'
                    } : null
                };
            }
            
            return results;
        });
        
        // Print analysis results
        console.log('\n=== Technical Questions Analysis ===');
        console.log(`Total questions found: ${analysis.totalQuestions}`);
        console.log(`Questions with potential double quotes: ${analysis.questionsWithDoubleQuotes}`);
        
        if (analysis.questions.length > 0) {
            console.log('\nFirst 5 questions:');
            analysis.questions.slice(0, 5).forEach(q => {
                console.log(`\n${q.number}:`);
                console.log(`  Full text: "${q.fullText}"`);
                console.log(`  Title part: "${q.titlePart}"`);
                console.log(`  Quote count: ${q.quotesCount}`);
                console.log(`  Has double quotes issue: ${q.hasDoubleQuotes}`);
            });
            
            // Check if quotes are being doubled
            const sampleQuestion = analysis.questions[0];
            if (sampleQuestion && sampleQuestion.titlePart.startsWith('"') && sampleQuestion.titlePart.endsWith('"')) {
                console.log('\n⚠️  ISSUE FOUND: Questions are displaying with extra quotes!');
                console.log('The markdown parser is adding quotes in the template even though the title already has them.');
            }
        }
        
        if (analysis.markdownParserInfo) {
            console.log('\n=== Markdown Parser Info ===');
            console.log('Parser available:', analysis.markdownParserInfo.available);
            if (analysis.markdownParserInfo.testRegexResult) {
                console.log('Regex captures title without quotes:', analysis.markdownParserInfo.testRegexResult.title);
                console.log('But the template adds quotes back!');
            }
        }
        
        // Take screenshot
        const technicalSection = await page.$('#technical-devops-questions');
        if (technicalSection) {
            await technicalSection.screenshot({ 
                path: 'technical-questions-display.png',
                fullPage: false 
            });
            console.log('\n✅ Screenshot saved as technical-questions-display.png');
        }
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            analysis: analysis,
            recommendation: analysis.questionsWithDoubleQuotes > 0 ? 
                'Remove the hardcoded quotes from the createQuestionHTML template in markdown-parser.js' : 
                'No issues found'
        };
        
        fs.writeFileSync('question-display-detailed-report.json', JSON.stringify(report, null, 2));
        console.log('✅ Detailed report saved to question-display-detailed-report.json');
        
        await browser.close();
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        // Kill the server
        if (server) {
            console.log('\nStopping test server...');
            server.kill();
        }
    }
})();