const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    let filePath = path.join(ROOT_DIR, req.url === '/' ? 'dist/index.html' : req.url.slice(1));
    
    // Handle special routing for dist files
    if (req.url.startsWith('/dist/')) {
        filePath = path.join(ROOT_DIR, req.url.slice(1));
    } else if (req.url.startsWith('/src/')) {
        filePath = path.join(ROOT_DIR, req.url.slice(1));
    } else if (req.url === '/COMPLETE_TURING_INTERVIEW_GUIDE.md') {
        filePath = path.join(ROOT_DIR, 'src/markdown/COMPLETE_TURING_INTERVIEW_GUIDE.md');
    } else if (req.url === '/final-100-fix.js') {
        filePath = path.join(ROOT_DIR, 'final-100-fix.js');
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`404: ${filePath}`);
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${ROOT_DIR}`);
    console.log('\nPress Ctrl+C to stop the server');
});