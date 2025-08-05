const fs = require('fs');

// Read the current HTML
let html = fs.readFileSync('dist/index.html', 'utf-8');

// Find where to insert the renderSection method - right after renderQuestion method
const renderQuestionEnd = html.indexOf('return html;', html.indexOf('renderQuestion(q)')) + 'return html;'.length;
const nextMethodStart = html.indexOf('}', renderQuestionEnd) + 1;

// Insert the renderSection method
const renderSectionMethod = `
            
            renderSection(section) {
                // Process content with code blocks
                let content = section.content;
                const codeBlocks = [];
                const codeRegex = /\`\`\`(\\w*)\\n?([\\s\\S]*?)\`\`\`/g;
                
                content = content.replace(codeRegex, (match, lang, code) => {
                    const placeholder = \`__SECTION_CODE_BLOCK_\${codeBlocks.length}__\`;
                    codeBlocks.push({
                        lang: lang || 'typescript',
                        code: code.trim()
                    });
                    return placeholder;
                });
                
                // Parse markdown
                let html = \`<section class="mb-5">
                    <h2>\${section.title}</h2>\`;
                
                // Split by subsections
                const subsections = content.split(/\\n### /);
                const mainContent = subsections[0];
                
                // Render main content
                if (mainContent.trim()) {
                    let processedContent = this.parseMarkdown(mainContent);
                    
                    // Replace code block placeholders
                    codeBlocks.forEach((block, index) => {
                        const placeholder = \`__SECTION_CODE_BLOCK_\${index}__\`;
                        const codeHtml = \`
                            <div class="position-relative mb-3">
                                <button class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2 copy-code">
                                    <i class="bi bi-clipboard"></i> Copy
                                </button>
                                <pre><code class="language-\${block.lang}">\${this.escapeHtml(block.code)}</code></pre>
                            </div>\`;
                        processedContent = processedContent.replace(placeholder, codeHtml);
                    });
                    
                    html += \`<div class="mb-3">\${processedContent}</div>\`;
                }
                
                // Render subsections
                subsections.slice(1).forEach(subsection => {
                    const [title, ...contentLines] = subsection.split('\\n');
                    const subsectionContent = contentLines.join('\\n');
                    
                    // Extract code blocks from subsection
                    const subsectionCodeBlocks = [];
                    let processedSubsection = subsectionContent.replace(codeRegex, (match, lang, code) => {
                        const placeholder = \`__SUBSECTION_CODE_BLOCK_\${subsectionCodeBlocks.length}__\`;
                        subsectionCodeBlocks.push({
                            lang: lang || 'typescript',
                            code: code.trim()
                        });
                        return placeholder;
                    });
                    
                    html += \`<h3>\${title}</h3>\`;
                    let subsectionHtml = this.parseMarkdown(processedSubsection);
                    
                    // Replace subsection code blocks
                    subsectionCodeBlocks.forEach((block, index) => {
                        const placeholder = \`__SUBSECTION_CODE_BLOCK_\${index}__\`;
                        const codeHtml = \`
                            <div class="position-relative mb-3">
                                <button class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2 copy-code">
                                    <i class="bi bi-clipboard"></i> Copy
                                </button>
                                <pre><code class="language-\${block.lang}">\${this.escapeHtml(block.code)}</code></pre>
                            </div>\`;
                        subsectionHtml = subsectionHtml.replace(placeholder, codeHtml);
                    });
                    
                    html += \`<div class="mb-3">\${subsectionHtml}</div>\`;
                });
                
                html += '</section>';
                return html;
            }`;

// Insert the method
html = html.substring(0, nextMethodStart) + renderSectionMethod + html.substring(nextMethodStart);

// Write the updated HTML
fs.writeFileSync('dist/index.html', html);
console.log('Added renderSection method to handle core concepts and other sections with code blocks');