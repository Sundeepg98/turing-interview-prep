// Test script to verify markdown rendering is fixed
const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'index-fixed.html');
const html = fs.readFileSync(htmlFile, 'utf8');

console.log('🔍 Testing for raw markdown patterns in the rendered HTML...\n');

// Test patterns that should NOT appear in the final HTML
const rawMarkdownPatterns = [
    { pattern: /```/g, description: 'Triple backticks (```)' },
    { pattern: /\*\*[^*]+\*\*/g, description: 'Bold markers (**)' },
    { pattern: /^###\s+/gm, description: 'Header markers (###)' },
    { pattern: /^---+$/gm, description: 'Horizontal rules (---)' },
    { pattern: /^-\s+\[\s*\]/gm, description: 'Unchecked checkboxes (- [ ])' },
    { pattern: /^-\s+\[x\]/gm, description: 'Checked checkboxes (- [x])' }
];

// Extract only the content that would be visible to users
// Remove script tags and their content
const visibleHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

let foundIssues = false;

for (const test of rawMarkdownPatterns) {
    const matches = visibleHtml.match(test.pattern);
    if (matches) {
        console.log(`❌ Found ${test.description}: ${matches.length} occurrences`);
        // Show first few examples
        matches.slice(0, 3).forEach(match => {
            console.log(`   Example: "${match}"`);
        });
        foundIssues = true;
    } else {
        console.log(`✅ No ${test.description} found`);
    }
}

console.log('\n📊 Test for proper HTML rendering...\n');

// Check for proper HTML elements that should exist
const htmlPatterns = [
    { pattern: /<pre><code class="language-/g, description: 'Code blocks' },
    { pattern: /<strong>/g, description: 'Bold text' },
    { pattern: /<h[2-4]>/g, description: 'Headers' },
    { pattern: /<hr>/g, description: 'Horizontal rules' },
    { pattern: /<input class="form-check-input" type="checkbox"/g, description: 'Checkboxes' },
    { pattern: /<ul>/g, description: 'Unordered lists' },
    { pattern: /<ol>/g, description: 'Ordered lists' }
];

for (const test of htmlPatterns) {
    const matches = visibleHtml.match(test.pattern);
    if (matches) {
        console.log(`✅ Found ${matches.length} ${test.description}`);
    } else {
        console.log(`⚠️ No ${test.description} found`);
    }
}

if (!foundIssues) {
    console.log('\n🎉 All markdown rendering tests passed! No raw markdown syntax is visible.');
} else {
    console.log('\n⚠️ Some raw markdown syntax is still visible. Please check the output.');
}

// Test specific content rendering
console.log('\n🔍 Testing specific content areas...\n');

// Check if the markdown content script tag exists
const markdownScriptMatch = html.match(/<script id="markdownContent" type="text\/markdown">([\s\S]*?)<\/script>/);
if (markdownScriptMatch) {
    console.log('✅ Markdown content script found');
    const markdownContent = markdownScriptMatch[1];
    
    // Count important elements in the source
    const codeBlocksInSource = (markdownContent.match(/```/g) || []).length / 2;
    const boldInSource = (markdownContent.match(/\*\*/g) || []).length / 2;
    
    console.log(`   - Code blocks in source: ${codeBlocksInSource}`);
    console.log(`   - Bold markers in source: ${boldInSource}`);
} else {
    console.log('❌ Markdown content script not found');
}