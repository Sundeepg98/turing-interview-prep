const fs = require('fs');

// Mock window for browser code
global.window = {};

// Load the parser
const parserCode = fs.readFileSync('src/assets/js/markdown-parser.js', 'utf-8');
eval(parserCode);

const MarkdownStructureParser = global.window.MarkdownStructureParser;

// Load markdown
const markdown = fs.readFileSync('src/markdown/COMPLETE_TURING_INTERVIEW_GUIDE.md', 'utf-8');

// Create parser instance
const parser = new MarkdownStructureParser();

// Parse just a problematic section
const testSection = `**Key Methods**:
\`\`\`typescript
// .apply() - Transform future values
bucket.id.apply(id => console.log(\`Created: \${id}\`));

// pulumi.interpolate - Combine outputs  
const url = pulumi.interpolate\`https://\${bucket.websiteEndpoint}\`;

// pulumi.all() - Wait for multiple
pulumi.all([db.endpoint, db.port]).apply(([host, port]) => 
    \`postgresql://\${host}:\${port}\`
);
\`\`\`

**Common Mistake**: Trying to use \`.toString()\` on Output - always use \`.apply()\` instead.`;

console.log('Parsing test section...\n');
const result = parser.parseMarkdown(testSection);
console.log('HTML Output:');
console.log(result.html);

// Count code blocks in output
const codeBlockCount = (result.html.match(/<pre>/g) || []).length;
console.log(`\nCode blocks found: ${codeBlockCount}`);

// Check if code content is present
const hasContent = result.html.includes('.apply()');
console.log(`Contains .apply() content: ${hasContent}`);