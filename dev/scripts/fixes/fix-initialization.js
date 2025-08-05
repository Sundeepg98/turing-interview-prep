const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Fix 1: Move the markdown loading to the init method instead of constructor
const oldConstructor = `            constructor() {
                this.markdown = this.decodeHtmlEntities(document.getElementById('markdownContent').textContent)
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#039;/g, "'")
                    .replace(/&amp;/g, '&');
                this.container = document.getElementById('contentContainer');
                this.nav = document.getElementById('sidebarNav');
                this.data = {
                    questions: [],
                    sections: [],
                    starStories: [],
                    commands: []
                };`;

const newConstructor = `            constructor() {
                this.container = document.getElementById('contentContainer');
                this.nav = document.getElementById('sidebarNav');
                this.data = {
                    questions: [],
                    sections: [],
                    starStories: [],
                    commands: []
                };`;

// Replace the constructor
htmlContent = htmlContent.replace(oldConstructor, newConstructor);

// Fix 2: Add markdown loading at the beginning of init method
const oldInit = `            init() {
                console.log('🚀 Initializing Ultimate Content Renderer...');
                
                // Debug: Check the markdown content
                console.log('Markdown content length:', this.markdown.length);
                console.log('First 200 chars:', this.markdown.substring(0, 200));`;

const newInit = `            init() {
                console.log('🚀 Initializing Ultimate Content Renderer...');
                
                // Load and decode markdown content
                const markdownElement = document.getElementById('markdownContent');
                if (!markdownElement) {
                    console.error('❌ Markdown content not found!');
                    return;
                }
                
                this.markdown = this.decodeHtmlEntities(markdownElement.textContent);
                
                // Debug: Check the markdown content
                console.log('Markdown content length:', this.markdown.length);
                console.log('First 200 chars:', this.markdown.substring(0, 200));`;

// Replace the init method beginning
htmlContent = htmlContent.replace(oldInit, newInit);

// Write the updated HTML
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('Successfully fixed initialization order in dist/index.html');