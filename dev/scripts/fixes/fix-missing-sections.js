const fs = require('fs');

// Read the current HTML
let html = fs.readFileSync('dist/index.html', 'utf-8');

// Find the renderAllContent method and add section rendering
const renderAllContentStart = html.indexOf('renderAllContent() {');
const renderAllContentEnd = html.indexOf('this.container.innerHTML = html;', renderAllContentStart) + 'this.container.innerHTML = html;'.length;

// Extract the current method
const currentMethod = html.substring(renderAllContentStart, renderAllContentEnd);

// Create the new method with section rendering
const newMethod = `renderAllContent() {
                let html = '';
                
                // Render Section 1: Core Concepts
                const coreSection = this.data.sections.find(s => s.title.includes('CORE CONCEPTS'));
                if (coreSection) {
                    html += this.renderSection(coreSection);
                }
                
                // Quick Reference
                html += this.renderQuickReference();
                
                // All 18 Questions
                html += '<section id="questions"><h2 class="mb-4">Technical Interview Questions</h2>';
                this.data.questions.forEach(q => {
                    html += this.renderQuestion(q);
                });
                html += '</section>';
                
                // STAR Stories
                if (this.data.starStories.length > 0) {
                    html += '<section id="star-stories"><h2 class="mb-4">STAR Stories</h2>';
                    this.data.starStories.forEach(story => {
                        html += this.renderStarStory(story);
                    });
                    html += '</section>';
                }
                
                // Commands
                html += this.renderCommands();
                
                // Render other sections
                const otherSections = this.data.sections.filter(s => 
                    !s.title.includes('TECHNICAL INTERVIEW') && 
                    !s.title.includes('CORE CONCEPTS')
                );
                otherSections.forEach(section => {
                    html += this.renderSection(section);
                });
                
                this.container.innerHTML = html;`;

// Replace the method
html = html.substring(0, renderAllContentStart) + newMethod + html.substring(renderAllContentEnd);

// Add the renderSection method if it doesn't exist
if (!html.includes('renderSection(section)')) {
    // Find a good place to insert it (after renderQuestion)
    const insertPoint = html.indexOf('renderStarStory(story) {');
    
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
                    
                    html += processedContent;
                }
                
                // Render subsections
                subsections.slice(1).forEach(subsection => {
                    const [title, ...contentLines] = subsection.split('\\n');
                    html += \`<h3>\${title}</h3>\`;
                    html += this.parseMarkdown(contentLines.join('\\n'));
                });
                
                html += '</section>';
                return html;
            }
            
            `;
    
    html = html.substring(0, insertPoint) + renderSectionMethod + html.substring(insertPoint);
}

// Write the updated HTML
fs.writeFileSync('dist/index.html', html);
console.log('Fixed HTML to render all sections including core concepts with code blocks');