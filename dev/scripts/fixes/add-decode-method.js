const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Add decodeHtmlEntities as a class method
const decodeMethod = `
            
            decodeHtmlEntities(text) {
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
            }`;

// Find the parseStarContent method and add the decode method after it
const parseStarContentRegex = /(parseStarContent\(content\)\s*{[\s\S]*?}\n\s*})/;
const match = htmlContent.match(parseStarContentRegex);

if (match) {
    const insertPosition = match.index + match[0].length;
    htmlContent = htmlContent.slice(0, insertPosition) + decodeMethod + htmlContent.slice(insertPosition);
    
    // Write the updated HTML
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    console.log('Successfully added decodeHtmlEntities method to the class');
} else {
    console.error('Could not find appropriate location to add method');
}