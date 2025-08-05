const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// The improved parseMarkdown function
const improvedParseMarkdown = `
            parseMarkdown(text) {
                // First decode HTML entities
                text = this.decodeHtmlEntities(text);
                
                // Store code blocks with placeholders to protect them
                const codeBlocks = [];
                text = text.replace(/\`\`\`(\\w*)\\n?([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
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
                
                // Handle horizontal rules
                text = text.replace(/^---+$/gm, '<hr>');
                
                // Handle headers (must be done in order)
                text = text.replace(/^### (.+)$/gm, '<h4>$1</h4>');
                text = text.replace(/^## (.+)$/gm, '<h3>$1</h3>');
                text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
                
                // Handle bold text (including multi-word)
                text = text.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
                
                // Handle italic text (but not list items)
                text = text.replace(/(?<!^[\\s]*[-*]\\s)\\*([^*\\n]+)\\*/g, '<em>$1</em>');
                
                // Handle checkboxes
                text = text.replace(/^- \\[ \\] (.+)$/gm, '<div class="form-check"><input class="form-check-input" type="checkbox" disabled><label class="form-check-label">$1</label></div>');
                text = text.replace(/^- \\[x\\] (.+)$/gm, '<div class="form-check"><input class="form-check-input" type="checkbox" checked disabled><label class="form-check-label">$1</label></div>');
                
                // Process lists line by line
                const lines = text.split('\\n');
                let processedLines = [];
                let inList = false;
                let listType = null;
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const trimmedLine = line.trim();
                    
                    // Check for bullet points
                    const bulletMatch = line.match(/^(\\s*)[-*]\\s+(.+)$/);
                    const numberMatch = line.match(/^(\\s*)\\d+\\.\\s+(.+)$/);
                    
                    if (bulletMatch) {
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
                        if (inList && trimmedLine === '') {
                            // Empty line might end the list
                            processedLines.push(\`</\${listType}>\`);
                            inList = false;
                            listType = null;
                        } else if (trimmedLine !== '') {
                            // Close list if we hit non-empty non-list content
                            if (inList) {
                                processedLines.push(\`</\${listType}>\`);
                                inList = false;
                                listType = null;
                            }
                            // Wrap non-empty lines in paragraphs
                            processedLines.push(\`<p>\${line}</p>\`);
                        } else {
                            // Empty line
                            processedLines.push('');
                        }
                    }
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
    <button class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2 copy-code" style="z-index: 10;">
        <i class="bi bi-clipboard"></i> Copy
    </button>
    <pre><code class="language-\${block.lang}">\${this.escapeHtml(block.code)}</code></pre>
</div>\`;
                    text = text.replace(\`__CODE_BLOCK_\${index}__\`, codeHtml);
                });
                
                return text;
            }`;

// Find and replace the parseMarkdown method
const parseMarkdownRegex = /parseMarkdown\(text\)\s*{[\s\S]*?(?=\n\s{12}\w+\(|$)/;
const match = htmlContent.match(parseMarkdownRegex);

if (match) {
    console.log('Found parseMarkdown method, replacing...');
    htmlContent = htmlContent.replace(parseMarkdownRegex, improvedParseMarkdown.trim());
    
    // Also need to ensure decodeHtmlEntities is called on the markdown content
    // Find where markdown is loaded from the script tag
    const markdownLoadRegex = /this\.markdown = document\.getElementById\('markdownContent'\)\.textContent/;
    if (htmlContent.match(markdownLoadRegex)) {
        htmlContent = htmlContent.replace(
            markdownLoadRegex,
            "this.markdown = this.decodeHtmlEntities(document.getElementById('markdownContent').textContent)"
        );
        console.log('Updated markdown loading to decode HTML entities');
    }
    
    // Write the updated HTML
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    console.log('Successfully patched dist/index.html with improved markdown parsing');
} else {
    console.error('Could not find parseMarkdown method in HTML file');
}