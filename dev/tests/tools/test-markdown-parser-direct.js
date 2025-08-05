const fs = require('fs');

// Load the markdown parser code
const parserCode = fs.readFileSync('./src/assets/js/markdown-parser.js', 'utf8');

// Create a mock window object
global.window = {};

// Execute the parser code
eval(parserCode);

// Now test the parser
const parser = new window.MarkdownStructureParser();

// Test question parsing
const testMarkdown = `## Technical DevOps Questions

### Q1: "How do you manage different environments?"

**Your Answer**: 
"I use Pulumi stacks for environment isolation. Each stack (dev, staging, prod) has its own state file and configuration."

### Q2: "What's your CI/CD pipeline architecture?"

**Your Answer**:
"I've built multi-stage pipelines using GitHub Actions with parallel jobs for efficiency."`;

console.log('=== Testing Markdown Parser ===\n');

// Test the regex pattern
const questionPattern = /^### (Q\d+): "(.+)"$/;
const testLine = '### Q1: "How do you manage different environments?"';
const match = testLine.match(questionPattern);

console.log('Regex test:');
console.log('Input:', testLine);
console.log('Match result:', match);
if (match) {
    console.log('  - Full match:', match[0]);
    console.log('  - Question number:', match[1]);
    console.log('  - Question title (without quotes):', match[2]);
}

// Test the createQuestionHTML method
console.log('\n=== Testing createQuestionHTML ===');
const testQuestion = {
    number: 'Q1',
    title: 'How do you manage different environments?',
    id: 'q1'
};

const htmlOutput = parser.createQuestionHTML(testQuestion);
console.log('Input question object:', testQuestion);
console.log('HTML output:', htmlOutput);

// Check if quotes are being doubled
if (htmlOutput.includes('""') || (htmlOutput.match(/"/g) || []).length > 2) {
    console.log('\n⚠️  ISSUE DETECTED: The HTML output contains extra quotes!');
    console.log('The template is adding quotes around ${question.title} even though the title doesn\'t have them.');
    console.log('\nThe problem is in line 334 of markdown-parser.js:');
    console.log('Current: <h3>${question.number}: "${question.title}"</h3>');
    console.log('Should be: <h3>${question.number}: ${question.title}</h3>');
} else {
    console.log('\n✅ No double quotes issue detected in HTML output');
}

// Parse full markdown
console.log('\n=== Testing Full Markdown Parsing ===');
const result = parser.parseMarkdown(testMarkdown);

// Find questions in the parsed structure
let questionCount = 0;
result.structure.sections.forEach(section => {
    section.subsections.forEach(sub => {
        if (sub.number) {
            questionCount++;
            console.log(`\nQuestion ${sub.number}:`);
            console.log(`  Title in structure: "${sub.title}"`);
        }
    });
});

console.log(`\nTotal questions found: ${questionCount}`);

// Save analysis
const analysis = {
    timestamp: new Date().toISOString(),
    regexTest: {
        input: testLine,
        capturedTitle: match ? match[2] : null,
        note: 'Title is captured WITHOUT the surrounding quotes'
    },
    htmlTemplateIssue: {
        currentTemplate: '<h3>${question.number}: "${question.title}"</h3>',
        problem: 'Template adds quotes even though title doesn\'t have them',
        solution: 'Remove the hardcoded quotes from the template'
    },
    fileToFix: {
        path: '/var/projects/interview_prep/src/assets/js/markdown-parser.js',
        line: 334,
        method: 'createQuestionHTML'
    }
};

fs.writeFileSync('markdown-parser-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n✅ Analysis saved to markdown-parser-analysis.json');