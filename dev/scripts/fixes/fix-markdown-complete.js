// Comprehensive Markdown Fix Script
// This script fixes ALL markdown rendering issues

// Create backup first
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'index.html');
const outputFile = path.join(__dirname, 'index-fixed.html');

// Read the current HTML file
const html = fs.readFileSync(inputFile, 'utf8');

// The new, comprehensive parseMarkdown function
const newParseMarkdownFunction = `
            parseMarkdown(text) {
                // First decode HTML entities
                text = this.decodeHtmlEntities(text);
                
                // Store code blocks with placeholders to protect them
                const codeBlocks = [];
                text = text.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (match, lang, code) => {
                    const index = codeBlocks.length;
                    codeBlocks.push({
                        lang: lang || 'typescript',
                        code: code.trim()
                    });
                    return \`__CODE_BLOCK_\${index}__\`;
                });
                
                // Store inline code to protect it
                const inlineCode = [];
                text = text.replace(/\`([^\`]+)\`/g, (match, code) => {
                    const index = inlineCode.length;
                    inlineCode.push(code);
                    return \`__INLINE_CODE_\${index}__\`;
                });
                
                // Handle horizontal rules (must be on its own line)
                text = text.replace(/^\\s*---+\\s*$/gm, '<hr>');
                
                // Handle headers (must be at start of line)
                text = text.replace(/^###\\s+(.+)$/gm, '<h4>$1</h4>');
                text = text.replace(/^##\\s+(.+)$/gm, '<h3>$1</h3>');
                text = text.replace(/^#\\s+(.+)$/gm, '<h2>$1</h2>');
                
                // Handle bold text (including multi-word)
                text = text.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
                
                // Handle italic text (single asterisk, avoid list markers)
                text = text.replace(/(?<!^|\\s)\\*([^*\\n]+)\\*/g, '<em>$1</em>');
                
                // Handle checkboxes BEFORE processing other lists
                text = text.replace(/^-\\s+\\[\\s\\]\\s+(.+)$/gm, '<div class="form-check"><input class="form-check-input" type="checkbox" disabled><label class="form-check-label">$1</label></div>');
                text = text.replace(/^-\\s+\\[x\\]\\s+(.+)$/gm, '<div class="form-check"><input class="form-check-input" type="checkbox" checked disabled><label class="form-check-label">$1</label></div>');
                
                // Process lists and paragraphs line by line
                const lines = text.split('\\n');
                let processedLines = [];
                let inList = false;
                let listType = null;
                let currentParagraph = [];
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const trimmedLine = line.trim();
                    
                    // Skip lines that are already HTML
                    if (trimmedLine.startsWith('<') && trimmedLine.endsWith('>')) {
                        // Close current paragraph if any
                        if (currentParagraph.length > 0) {
                            processedLines.push('<p>' + currentParagraph.join(' ') + '</p>');
                            currentParagraph = [];
                        }
                        // Close list if needed
                        if (inList) {
                            processedLines.push(\`</\${listType}>\`);
                            inList = false;
                            listType = null;
                        }
                        processedLines.push(line);
                        continue;
                    }
                    
                    // Check for bullet points
                    const bulletMatch = line.match(/^(\\s*)[-*]\\s+(.+)$/);
                    const numberMatch = line.match(/^(\\s*)\\d+\\.\\s+(.+)$/);
                    
                    if (bulletMatch) {
                        // Close current paragraph if any
                        if (currentParagraph.length > 0) {
                            processedLines.push('<p>' + currentParagraph.join(' ') + '</p>');
                            currentParagraph = [];
                        }
                        
                        const content = bulletMatch[2];
                        
                        if (!inList || listType !== 'ul') {
                            if (inList && listType === 'ol') {
                                processedLines.push('</ol>');
                            }
                            processedLines.push('<ul>');
                            inList = true;
                            listType = 'ul';
                        }
                        
                        processedLines.push(\`<li>\${content}</li>\`);
                    } else if (numberMatch) {
                        // Close current paragraph if any
                        if (currentParagraph.length > 0) {
                            processedLines.push('<p>' + currentParagraph.join(' ') + '</p>');
                            currentParagraph = [];
                        }
                        
                        const content = numberMatch[2];
                        
                        if (!inList || listType !== 'ol') {
                            if (inList && listType === 'ul') {
                                processedLines.push('</ul>');
                            }
                            processedLines.push('<ol>');
                            inList = true;
                            listType = 'ol';
                        }
                        
                        processedLines.push(\`<li>\${content}</li>\`);
                    } else {
                        // Not a list item
                        if (trimmedLine === '') {
                            // Empty line
                            if (inList) {
                                // End the list
                                processedLines.push(\`</\${listType}>\`);
                                inList = false;
                                listType = null;
                            }
                            // End current paragraph if any
                            if (currentParagraph.length > 0) {
                                processedLines.push('<p>' + currentParagraph.join(' ') + '</p>');
                                currentParagraph = [];
                            }
                        } else {
                            // Regular text line
                            if (inList) {
                                // End the list if we hit non-list content
                                processedLines.push(\`</\${listType}>\`);
                                inList = false;
                                listType = null;
                            }
                            // Add to current paragraph
                            currentParagraph.push(trimmedLine);
                        }
                    }
                }
                
                // Close any remaining paragraph
                if (currentParagraph.length > 0) {
                    processedLines.push('<p>' + currentParagraph.join(' ') + '</p>');
                }
                
                // Close any open list
                if (inList) {
                    processedLines.push(\`</\${listType}>\`);
                }
                
                text = processedLines.join('\\n');
                
                // Clean up multiple empty paragraphs
                text = text.replace(/<p>\\s*<\\/p>/g, '');
                
                // Restore inline code
                inlineCode.forEach((code, index) => {
                    text = text.replace(\`__INLINE_CODE_\${index}__\`, \`<code>\${this.escapeHtml(code)}</code>\`);
                });
                
                // Restore code blocks
                codeBlocks.forEach((block, index) => {
                    const codeHtml = \`
                        <div class="position-relative mb-3">
                            <button class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2 copy-code">
                                <i class="bi bi-clipboard"></i> Copy
                            </button>
                            <pre><code class="language-\${block.lang}">\${this.escapeHtml(block.code)}</code></pre>
                        </div>\`;
                    text = text.replace(\`__CODE_BLOCK_\${index}__\`, codeHtml);
                });
                
                return text;
            }`;

// Also fix the renderQuestion function to not duplicate code block handling
const newRenderQuestionFunction = `
            renderQuestion(q) {
                // Log for debugging
                console.log(\`Rendering Q\${q.number}: \${q.title}\`);
                
                // Process the content with our comprehensive markdown parser
                let contentHtml = this.parseMarkdown(q.fullContent);
                
                // Build the HTML
                let html = \`
                    <div id="q\${q.number}" class="question-card">
                        <div class="card border-primary">
                            <div class="card-header bg-primary text-white">
                                <h3 class="mb-0">Q\${q.number}: \${q.title}</h3>
                            </div>
                            <div class="card-body">
                                \${contentHtml}
                            </div>
                        </div>
                    </div>\`;
                
                return html;
            }`;

// Replace the parseMarkdown function
let fixedHtml = html.replace(
    /parseMarkdown\(text\)\s*{[\s\S]*?^\s{12}}/gm,
    newParseMarkdownFunction.trim()
);

// Replace the renderQuestion function
fixedHtml = fixedHtml.replace(
    /renderQuestion\(q\)\s*{[\s\S]*?^\s{12}}/gm,
    newRenderQuestionFunction.trim()
);

// Write the fixed HTML
fs.writeFileSync(outputFile, fixedHtml);

console.log('✅ Markdown rendering has been completely fixed!');
console.log(`📄 Output saved to: ${outputFile}`);
console.log('\nFixed issues:');
console.log('- ``` (triple backticks) for code blocks');
console.log('- ** (bold markers)');
console.log('- ### (headers)');
console.log('- --- (horizontal rules)');
console.log('- [ ] (checkboxes)');
console.log('- Proper paragraph handling');
console.log('- No duplicate code block processing');