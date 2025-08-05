const fs = require('fs');

// Read the current HTML
let html = fs.readFileSync('dist/index.html', 'utf-8');

// Find and replace the renderSection method
const renderSectionStart = html.indexOf('renderSection(section) {');
const renderSectionEnd = html.indexOf('return html;', renderSectionStart) + 'return html;'.length;
const nextBrace = html.indexOf('}', renderSectionEnd) + 1;

// New renderSection that works properly with parseMarkdown
const newRenderSection = `renderSection(section) {
                let html = \`<section class="mb-5">
                    <h2>\${section.title}</h2>\`;
                
                // Split by subsections
                const subsections = section.content.split(/\\n### /);
                const mainContent = subsections[0];
                
                // Render main content
                if (mainContent.trim()) {
                    html += \`<div class="mb-3">\${this.parseMarkdown(mainContent)}</div>\`;
                }
                
                // Render subsections
                subsections.slice(1).forEach(subsection => {
                    const [title, ...contentLines] = subsection.split('\\n');
                    const subsectionContent = contentLines.join('\\n');
                    
                    html += \`<h3>\${title}</h3>\`;
                    html += \`<div class="mb-3">\${this.parseMarkdown(subsectionContent)}</div>\`;
                });
                
                html += '</section>';
                return html;
            }`;

// Replace the method
html = html.substring(0, renderSectionStart) + newRenderSection + html.substring(nextBrace);

// Also need to update parseMarkdown to handle code blocks properly
// Find the section in parseMarkdown that restores code blocks
const restoreCodeStart = html.indexOf('// Restore code blocks');
const restoreCodeEnd = html.indexOf('});', restoreCodeStart) + '});'.length;

// Check if the restore section exists and is properly handling code blocks
if (restoreCodeStart > -1) {
    // Update the code block restoration to include proper HTML
    const newRestoreCode = `// Restore code blocks
                codeBlocks.forEach((block, index) => {
                    const codeHtml = \`
                        <div class="position-relative mb-3">
                            <button class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2 copy-code">
                                <i class="bi bi-clipboard"></i> Copy
                            </button>
                            <pre><code class="language-\${block.lang}">\${this.escapeHtml(block.code)}</code></pre>
                        </div>\`;
                    text = text.replace(\`__CODE_BLOCK_\${index}__\`, codeHtml);
                });`;
    
    html = html.substring(0, restoreCodeStart) + newRestoreCode + html.substring(restoreCodeEnd);
}

// Write the updated HTML
fs.writeFileSync('dist/index.html', html);
console.log('Fixed renderSection to work properly with parseMarkdown');