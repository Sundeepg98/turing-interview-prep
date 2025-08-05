const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    try {
        // Launch browser
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Browser console error:', msg.text());
            }
        });
        
        // Navigate to the page on existing server
        console.log('Navigating to http://localhost:8080/');
        await page.goto('http://localhost:8080/');
        
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
                
                // Test what the createQuestionHTML function produces
                if (parser.createQuestionHTML) {
                    const testQuestion = {
                        number: 'Q1',
                        title: 'How do you manage different environments?',
                        id: 'q1'
                    };
                    results.markdownParserInfo.htmlOutput = parser.createQuestionHTML(testQuestion);
                }
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
                console.log('But the template adds quotes back in createQuestionHTML!');
            }
            if (analysis.markdownParserInfo.htmlOutput) {
                console.log('\nHTML output from createQuestionHTML:');
                console.log(analysis.markdownParserInfo.htmlOutput);
            }
        }
        
        // Take screenshot of a specific question
        const firstQuestion = await page.$('.question-container');
        if (firstQuestion) {
            await firstQuestion.screenshot({ 
                path: 'first-question-display.png'
            });
            console.log('\n✅ Screenshot of first question saved as first-question-display.png');
        }
        
        // Take screenshot of technical section
        const technicalSection = await page.$('#technical-devops-questions');
        if (technicalSection) {
            await technicalSection.screenshot({ 
                path: 'technical-questions-section.png'
            });
            console.log('✅ Screenshot of technical section saved as technical-questions-section.png');
        }
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            analysis: analysis,
            issue: 'The markdown-parser.js file has hardcoded quotes in the createQuestionHTML method',
            solution: 'Remove the quotes from line 334 in markdown-parser.js',
            codeToFix: {
                file: '/var/projects/interview_prep/src/assets/js/markdown-parser.js',
                line: 334,
                current: '<h3>${question.number}: "${question.title}"</h3>',
                fixed: '<h3>${question.number}: ${question.title}</h3>'
            }
        };
        
        fs.writeFileSync('question-quotes-analysis.json', JSON.stringify(report, null, 2));
        console.log('\n✅ Analysis report saved to question-quotes-analysis.json');
        
        await browser.close();
        
    } catch (error) {
        console.error('Test error:', error);
    }
})();