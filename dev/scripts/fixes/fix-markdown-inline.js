// Inline fix for markdown parsing issues
// This script will be added directly to index.html

// Enhanced parseMarkdown method
const enhancedParseMarkdown = function(text) {
    // First, handle code blocks to protect them from other processing
    const codeBlocks = [];
    let codeBlockIndex = 0;
    
    // Handle triple backtick code blocks
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
        codeBlocks.push({
            lang: lang || 'typescript',
            code: code.trim()
        });
        codeBlockIndex++;
        return placeholder;
    });
    
    // Handle inline code (must be done after code blocks)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle horizontal rules (must be done before lists)
    text = text.replace(/^---+$/gm, '<hr>');
    
    // Handle headers (process in order from largest to smallest)
    text = text.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    text = text.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    
    // Handle bold text
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle lists properly
    const lines = text.split('\n');
    let inList = false;
    let listType = null;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
        const numberMatch = line.match(/^\s*\d+\.\s+(.+)$/);
        
        if (bulletMatch) {
            if (!inList || listType !== 'ul') {
                if (inList) processedLines.push(`</${listType}>`);
                processedLines.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            processedLines.push(`<li>${bulletMatch[1]}</li>`);
        } else if (numberMatch) {
            if (!inList || listType !== 'ol') {
                if (inList) processedLines.push(`</${listType}>`);
                processedLines.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            processedLines.push(`<li>${numberMatch[1]}</li>`);
        } else {
            if (inList) {
                processedLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            processedLines.push(line);
        }
    }
    
    if (inList) {
        processedLines.push(`</${listType}>`);
    }
    
    text = processedLines.join('\n');
    
    // Handle paragraphs
    text = text.split('\n\n').map(para => {
        para = para.trim();
        if (!para) return '';
        // Don't wrap if it's already an HTML element
        if (para.match(/^<(h[1-6]|ul|ol|hr|div|p)/)) {
            return para;
        }
        return `<p>${para}</p>`;
    }).join('\n');
    
    // Restore code blocks with proper formatting
    codeBlocks.forEach((block, index) => {
        const codeHtml = `<pre><code class="language-${block.lang}">${this.escapeHtml(block.code)}</code></pre>`;
        text = text.replace(`__CODE_BLOCK_${index}__`, codeHtml);
    });
    
    return text;
};

// HTML entity decoder
const decodeHtmlEntities = function(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&apos;': "'",
        '&nbsp;': ' ',
        '&mdash;': '—',
        '&ndash;': '–',
        '&hellip;': '…',
        '&ldquo;': '"',
        '&rdquo;': '"',
        '&lsquo;': ''',
        '&rsquo;': '''
    };
    
    return text.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
};

// Add to window for testing
window.enhancedParseMarkdown = enhancedParseMarkdown;
window.decodeHtmlEntities = decodeHtmlEntities;