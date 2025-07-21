/**
 * Markdown Structure Parser for Interview Guide
 * Converts markdown patterns to Bootstrap HTML structure
 */

class MarkdownStructureParser {
    constructor() {
        this.patterns = {
            // Section headers
            majorSection: /^## (.+)$/,
            subsection: /^### (.+)$/,
            
            // Question patterns
            question: /^### (Q\d+): "(.+)"$/,
            
            // Content patterns
            yourAnswer: /^\*\*Your Answer\*\*:\s*$/,
            simpleAnswer: /^\*\*Simple Answer\*\*:\s*(.+)$/,
            yourExperience: /^\*\*Your Experience\*\*:\s*(.+)$/,
            whyItMatters: /^\*\*Why It Matters\*\*:\s*$/,
            whyCritical: /^\*\*Why Critical\*\*:\s*(.+)$/,
            keyMethods: /^\*\*Key Methods\*\*:\s*$/,
            commonMistake: /^\*\*Common Mistake\*\*:\s*(.+)$/,
            yourImplementation: /^\*\*Your Implementation\*\*:\s*$/,
            whyYouBuiltThem: /^\*\*Why You Built Them\*\*:\s*$/,
            unitTests: /^\*\*Unit Tests \(Fast, Mocked\)\*\*:\s*$/,
            
            // STAR patterns
            situation: /^\*\*Situation\*\*:\s*(.+)$/,
            task: /^\*\*Task\*\*:\s*(.+)$/,
            action: /^\*\*Action\*\*:\s*$/,
            result: /^\*\*Result\*\*:\s*(.+)$/,
            
            // Code block
            codeStart: /^```(\w+)?$/,
            codeEnd: /^```$/,
            
            // List items
            listItem: /^[-*]\s+(.+)$/,
            numberedItem: /^\d+\.\s+(.+)$/,
            
            // Inline patterns
            bold: /\*\*([^*]+)\*\*/g,
            code: /`([^`]+)`/g,
            italic: /\*([^*]+)\*/g
        };
        
        this.state = {
            inCodeBlock: false,
            inList: false,
            currentSection: null,
            currentSubsection: null
        };
    }
    
    /**
     * Parse markdown content and convert to structured HTML
     */
    parseMarkdown(markdown) {
        const lines = markdown.split('\n');
        const structure = {
            quickReference: {},
            sections: []
        };
        
        let currentSection = null;
        let currentSubsection = null;
        let currentQuestion = null;
        let htmlOutput = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = lines[i + 1] || '';
            
            // Check for major section
            if (this.patterns.majorSection.test(line)) {
                const match = line.match(this.patterns.majorSection);
                currentSection = {
                    title: match[1],
                    id: this.slugify(match[1]),
                    subsections: []
                };
                structure.sections.push(currentSection);
                
                htmlOutput += this.createSectionHTML(currentSection);
                continue;
            }
            
            // Check for question
            if (this.patterns.question.test(line)) {
                const match = line.match(this.patterns.question);
                currentQuestion = {
                    number: match[1],
                    title: match[2],
                    id: match[1].toLowerCase(),
                    content: []
                };
                
                if (currentSection) {
                    currentSection.subsections.push(currentQuestion);
                }
                
                htmlOutput += this.createQuestionHTML(currentQuestion);
                continue;
            }
            
            // Check for subsection
            if (this.patterns.subsection.test(line) && !this.patterns.question.test(line)) {
                const match = line.match(this.patterns.subsection);
                currentSubsection = {
                    title: match[1],
                    id: this.slugify(match[1]),
                    content: []
                };
                
                if (currentSection) {
                    currentSection.subsections.push(currentSubsection);
                }
                
                htmlOutput += this.createSubsectionHTML(currentSubsection);
                continue;
            }
            
            // Parse content patterns
            htmlOutput += this.parseContentLine(line, nextLine);
        }
        
        return {
            structure,
            html: htmlOutput
        };
    }
    
    /**
     * Parse individual content lines
     */
    parseContentLine(line, nextLine) {
        let html = '';
        
        // Code blocks
        if (this.patterns.codeStart.test(line) && !this.state.inCodeBlock) {
            this.state.inCodeBlock = true;
            const language = line.match(this.patterns.codeStart)[1] || 'typescript';
            html += `<div class="code-container">
                     <button class="btn btn-sm btn-outline-secondary copy-button">
                         <i class="bi bi-clipboard"></i> Copy
                     </button>
                     <pre><code class="language-${language}">`;
            return html;
        }
        
        if (this.patterns.codeEnd.test(line) && this.state.inCodeBlock) {
            this.state.inCodeBlock = false;
            html += `</code></pre></div>`;
            return html;
        }
        
        if (this.state.inCodeBlock) {
            html += this.escapeHtml(line) + '\n';
            return html;
        }
        
        // Your Answer pattern
        if (this.patterns.yourAnswer.test(line)) {
            html += `<div class="answer-block">
                     <h5>Your Answer:</h5>`;
            if (nextLine) {
                html += `<p>${this.parseInlineMarkdown(nextLine)}</p>`;
            }
            html += `</div>`;
            return html;
        }
        
        // Simple Answer pattern
        if (this.patterns.simpleAnswer.test(line)) {
            const match = line.match(this.patterns.simpleAnswer);
            html += `<div class="answer-block">
                     <p><strong>Simple Answer:</strong> ${this.parseInlineMarkdown(match[1])}</p>
                     </div>`;
            return html;
        }
        
        // Your Experience pattern
        if (this.patterns.yourExperience.test(line)) {
            const match = line.match(this.patterns.yourExperience);
            html += `<div class="experience-block">
                     <p><strong>Your Experience:</strong> ${this.parseInlineMarkdown(match[1])}</p>
                     </div>`;
            return html;
        }
        
        // Why It Matters pattern
        if (this.patterns.whyItMatters.test(line)) {
            html += `<div class="key-points">
                     <h5>Why It Matters:</h5>
                     <ul class="content-list">`;
            this.state.inList = true;
            return html;
        }
        
        // Why Critical pattern
        if (this.patterns.whyCritical.test(line)) {
            const match = line.match(this.patterns.whyCritical);
            html += `<div class="critical-point">
                     <p><strong>Why Critical:</strong> ${this.parseInlineMarkdown(match[1])}</p>
                     </div>`;
            return html;
        }
        
        // Key Methods pattern
        if (this.patterns.keyMethods.test(line)) {
            html += `<div class="key-methods">
                     <h5>Key Methods:</h5>
                     </div>`;
            return html;
        }
        
        // Your Implementation pattern
        if (this.patterns.yourImplementation.test(line)) {
            html += `<div class="implementation-block">
                     <h5>Your Implementation:</h5>
                     </div>`;
            return html;
        }
        
        // Why You Built Them pattern
        if (this.patterns.whyYouBuiltThem.test(line)) {
            html += `<div class="why-built">
                     <h5>Why You Built Them:</h5>
                     <ul class="content-list">`;
            this.state.inList = true;
            return html;
        }
        
        // Unit Tests pattern
        if (this.patterns.unitTests.test(line)) {
            html += `<div class="unit-tests">
                     <h5>Unit Tests (Fast, Mocked):</h5>
                     </div>`;
            return html;
        }
        
        // Common Mistake pattern
        if (this.patterns.commonMistake.test(line)) {
            const match = line.match(this.patterns.commonMistake);
            html += `<div class="mistake-alert">
                     <p><strong>Common Mistake:</strong> ${this.parseInlineMarkdown(match[1])}</p>
                     </div>`;
            return html;
        }
        
        // STAR Story patterns
        if (this.patterns.situation.test(line)) {
            const match = line.match(this.patterns.situation);
            html += `<div class="star-story">
                     <p><strong>Situation:</strong> ${this.parseInlineMarkdown(match[1])}</p>`;
            return html;
        }
        
        // Task pattern
        if (this.patterns.task.test(line)) {
            const match = line.match(this.patterns.task);
            html += `<p><strong>Task:</strong> ${this.parseInlineMarkdown(match[1])}</p>`;
            return html;
        }
        
        // Action pattern
        if (this.patterns.action.test(line)) {
            html += `<h5>Action:</h5>`;
            return html;
        }
        
        // Result pattern
        if (this.patterns.result.test(line)) {
            const match = line.match(this.patterns.result);
            html += `<p><strong>Result:</strong> ${this.parseInlineMarkdown(match[1])}</p>
                     </div>`; // Close star-story div
            return html;
        }
        
        // List items
        if (this.patterns.listItem.test(line)) {
            const match = line.match(this.patterns.listItem);
            if (!this.state.inList) {
                html += `<ul class="content-list">`;
                this.state.inList = true;
            }
            html += `<li>${this.parseInlineMarkdown(match[1])}</li>`;
            return html;
        }
        
        // End list if empty line
        if (line.trim() === '' && this.state.inList) {
            html += `</ul>`;
            this.state.inList = false;
            return html;
        }
        
        // Regular paragraph
        if (line.trim() !== '') {
            html += `<p>${this.parseInlineMarkdown(line)}</p>`;
        }
        
        return html;
    }
    
    /**
     * Parse inline markdown (bold, italic, code)
     */
    parseInlineMarkdown(text) {
        return text
            .replace(this.patterns.bold, '<strong>$1</strong>')
            .replace(this.patterns.code, '<code>$1</code>')
            .replace(this.patterns.italic, '<em>$1</em>');
    }
    
    /**
     * Create HTML for sections
     */
    createSectionHTML(section) {
        return `
        <section id="${section.id}" class="major-section">
            <h2>${section.title}</h2>
        </section>`;
    }
    
    /**
     * Create HTML for questions
     */
    createQuestionHTML(question) {
        return `
        <div id="${question.id}" class="question-container">
            <div class="question-header">
                <h3>${question.number}: ${question.title}</h3>
            </div>
            <div class="question-body">
        </div>`;
    }
    
    /**
     * Create HTML for subsections
     */
    createSubsectionHTML(subsection) {
        return `
        <div id="${subsection.id}" class="subsection">
            <h3>${subsection.title}</h3>
        </div>`;
    }
    
    /**
     * Create navigation from structure
     */
    createNavigation(structure) {
        let nav = '<ul class="nav flex-column">';
        
        structure.sections.forEach(section => {
            nav += `
            <li class="nav-item">
                <a class="nav-link" href="#${section.id}">
                    <i class="bi bi-folder"></i> ${section.title}
                </a>`;
            
            if (section.subsections.length > 0) {
                nav += '<ul class="nav flex-column ms-3">';
                section.subsections.forEach(sub => {
                    const icon = sub.number ? 'bi-question-circle' : 'bi-file-text';
                    const text = sub.number ? `${sub.number}: ${sub.title}` : sub.title;
                    nav += `
                    <li class="nav-item">
                        <a class="nav-link" href="#${sub.id}">
                            <i class="bi ${icon}"></i> ${text}
                        </a>
                    </li>`;
                });
                nav += '</ul>';
            }
            
            nav += '</li>';
        });
        
        nav += '</ul>';
        return nav;
    }
    
    /**
     * Utility functions
     */
    slugify(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Export for use
window.MarkdownStructureParser = MarkdownStructureParser;