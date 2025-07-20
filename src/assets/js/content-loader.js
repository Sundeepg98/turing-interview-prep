/**
 * Content Loader for Interview Guide
 * Loads markdown content and populates Bootstrap structure
 */

class ContentLoader {
    constructor() {
        this.parser = new MarkdownStructureParser();
        this.contentFile = 'COMPLETE_TURING_INTERVIEW_GUIDE.md';
    }
    
    /**
     * Load markdown content from file
     */
    async loadMarkdownFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading markdown:', error);
            return null;
        }
    }
    
    /**
     * Initialize the content loading process
     */
    async initialize() {
        // Show loading state
        this.showLoadingState();
        
        // Load markdown content
        const markdown = await this.loadMarkdownFile(this.contentFile);
        if (!markdown) {
            this.showErrorState();
            return;
        }
        
        // Parse markdown to structured data
        const { structure, html } = this.parser.parseMarkdown(markdown);
        
        // Populate navigation
        this.populateNavigation(structure);
        
        // Populate main content
        this.populateContent(structure);
        
        // Initialize interactive features
        this.initializeFeatures();
        
        // Hide loading state
        this.hideLoadingState();
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
                    <div class="text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="text-muted">Loading interview guide content...</p>
                    </div>
                </div>`;
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        // Content is already populated, no need to do anything
    }
    
    /**
     * Show error state
     */
    showErrorState() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="alert alert-danger m-4" role="alert">
                    <h4 class="alert-heading">Error Loading Content</h4>
                    <p>Unable to load the interview guide content. Please check if the markdown file exists.</p>
                </div>`;
        }
    }
    
    /**
     * Populate navigation from structure
     */
    populateNavigation(structure) {
        const navContainer = document.querySelector('.sidebar .nav');
        if (!navContainer) return;
        
        // Clear existing navigation
        navContainer.innerHTML = '';
        
        // Add quick reference
        navContainer.innerHTML += `
            <li class="nav-item">
                <a class="nav-link active" href="#quick-ref">
                    <i class="bi bi-speedometer2"></i> Quick Reference
                </a>
            </li>`;
        
        // Add sections
        structure.sections.forEach((section, index) => {
            const sectionId = section.id || `section-${index}`;
            let navItem = `
                <li class="nav-item">
                    <a class="nav-link" href="#${sectionId}">
                        <i class="bi ${this.getSectionIcon(section.title)}"></i> ${this.getSectionShortTitle(section.title)}
                    </a>`;
            
            // Add subsections if any
            if (section.subsections && section.subsections.length > 0) {
                navItem += '<ul class="nav flex-column ms-3 small">';
                section.subsections.forEach(sub => {
                    const subId = sub.id || this.parser.slugify(sub.title);
                    const subTitle = sub.number ? `${sub.number}: ${sub.title}` : sub.title;
                    navItem += `
                        <li class="nav-item">
                            <a class="nav-link py-1" href="#${subId}">${subTitle}</a>
                        </li>`;
                });
                navItem += '</ul>';
            }
            
            navItem += '</li>';
            navContainer.innerHTML += navItem;
        });
    }
    
    /**
     * Populate main content from structure
     */
    populateContent(structure) {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;
        
        let contentHTML = '';
        
        // Add header
        contentHTML += `
            <div class="section-header mt-4">
                <h1 class="display-4">Complete Turing Interview Guide</h1>
                <p class="lead mb-0">Pulumi/TypeScript DevOps Engineer Position</p>
            </div>`;
        
        // Add quick reference section
        contentHTML += this.createQuickReferenceSection();
        
        // Add each section
        structure.sections.forEach((section, index) => {
            contentHTML += this.createSection(section, index);
        });
        
        // Add commands reference
        contentHTML += this.createCommandsSection();
        
        mainContent.innerHTML = contentHTML;
    }
    
    /**
     * Create quick reference section
     */
    createQuickReferenceSection() {
        return `
            <section id="quick-ref" class="mb-5">
                <h2 class="border-bottom pb-2 mb-3">Quick Reference</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Position Details</h5>
                                <ul class="list-unstyled">
                                    <li><strong>Role:</strong> Cloud Infrastructure Engineer</li>
                                    <li><strong>Tech Stack:</strong> Pulumi + TypeScript</li>
                                    <li><strong>Company:</strong> Turing (AI-powered tech services)</li>
                                    <li><strong>Scale:</strong> 3M developers, 900+ clients</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Your Achievements</h5>
                                <ul class="list-unstyled">
                                    <li><strong>Resources:</strong> 200+ managed</li>
                                    <li><strong>Deployment:</strong> 85% faster</li>
                                    <li><strong>Cost:</strong> 35% reduction</li>
                                    <li><strong>Experience:</strong> IaC migration specialist</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`;
    }
    
    /**
     * Create section HTML
     */
    createSection(section, index) {
        const sectionId = section.id || `section-${index}`;
        let sectionHTML = `
            <section id="${sectionId}" class="mb-5">
                <h2 class="border-bottom pb-2 mb-3">${section.title}</h2>`;
        
        // Add subsections
        if (section.subsections) {
            section.subsections.forEach(sub => {
                if (sub.number) {
                    // It's a question
                    sectionHTML += this.createQuestionCard(sub);
                } else {
                    // It's a concept or other subsection
                    sectionHTML += this.createConceptCard(sub);
                }
            });
        }
        
        sectionHTML += '</section>';
        return sectionHTML;
    }
    
    /**
     * Create question card
     */
    createQuestionCard(question) {
        const questionId = question.id || this.parser.slugify(`${question.number}-${question.title}`);
        return `
            <div id="${questionId}" class="mb-4">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h3 class="mb-0">${question.number}: "${question.title}"</h3>
                    </div>
                    <div class="card-body">
                        ${this.formatQuestionContent(question.content)}
                    </div>
                </div>
            </div>`;
    }
    
    /**
     * Create concept card
     */
    createConceptCard(concept) {
        const conceptId = concept.id || this.parser.slugify(concept.title);
        return `
            <div id="${conceptId}" class="mb-4">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h3 class="mb-0">${concept.title}</h3>
                    </div>
                    <div class="card-body">
                        ${this.formatConceptContent(concept.content)}
                    </div>
                </div>
            </div>`;
    }
    
    /**
     * Format question content
     */
    formatQuestionContent(content) {
        // This would use the parsed content structure
        // For now, return a template
        return `
            <div class="alert alert-info">
                <h5>Your Answer:</h5>
                <p>Content will be loaded from markdown...</p>
            </div>`;
    }
    
    /**
     * Format concept content
     */
    formatConceptContent(content) {
        // This would use the parsed content structure
        // For now, return a template
        return `
            <div class="alert alert-primary">
                <p>Content will be loaded from markdown...</p>
            </div>`;
    }
    
    /**
     * Create commands section
     */
    createCommandsSection() {
        return `
            <section id="commands" class="mb-5">
                <h2 class="border-bottom pb-2 mb-3">QUICK COMMAND REFERENCE</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">Stack Management</div>
                            <div class="card-body">
                                <pre class="mb-0"><code class="language-bash"># Stack Management
pulumi stack init dev
pulumi stack select prod
pulumi config set aws:region us-east-1</code></pre>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">Deployment</div>
                            <div class="card-body">
                                <pre class="mb-0"><code class="language-bash"># Deployment
pulumi up --yes              # Skip confirmation
pulumi preview --diff        # See detailed changes
pulumi destroy --target urn  # Remove specific resource</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`;
    }
    
    /**
     * Initialize interactive features
     */
    initializeFeatures() {
        // Initialize code copy buttons
        this.initializeCodeCopy();
        
        // Initialize navigation active state
        this.initializeActiveNavigation();
        
        // Initialize search
        this.initializeSearch();
        
        // Initialize progress tracking
        this.initializeProgressTracking();
    }
    
    /**
     * Initialize code copy functionality
     */
    initializeCodeCopy() {
        document.querySelectorAll('.copy-code').forEach(button => {
            button.addEventListener('click', function() {
                const code = this.parentElement.querySelector('code').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    const icon = this.querySelector('i');
                    icon.classList.remove('bi-clipboard');
                    icon.classList.add('bi-check');
                    setTimeout(() => {
                        icon.classList.remove('bi-check');
                        icon.classList.add('bi-clipboard');
                    }, 2000);
                });
            });
        });
    }
    
    /**
     * Initialize active navigation
     */
    initializeActiveNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section');
        
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - 100)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Initialize search functionality
     */
    initializeSearch() {
        // Add search box to navigation
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const searchBox = document.createElement('div');
            searchBox.className = 'p-3';
            searchBox.innerHTML = `
                <input type="text" class="form-control" id="searchInput" placeholder="Search questions...">
                <div id="searchResults" class="mt-2"></div>`;
            sidebar.insertBefore(searchBox, sidebar.firstChild);
            
            // Add search functionality
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }
    
    /**
     * Perform search
     */
    performSearch(query) {
        if (!query) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        // Search through all questions and concepts
        const results = [];
        document.querySelectorAll('.card-header h3').forEach(header => {
            if (header.textContent.toLowerCase().includes(query.toLowerCase())) {
                const card = header.closest('.card');
                const section = card.closest('section');
                results.push({
                    title: header.textContent,
                    sectionTitle: section.querySelector('h2').textContent,
                    id: card.parentElement.id
                });
            }
        });
        
        // Display results
        const resultsContainer = document.getElementById('searchResults');
        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(r => `
                <a href="#${r.id}" class="d-block small py-1 text-decoration-none">
                    ${r.title}
                    <span class="text-muted d-block">${r.sectionTitle}</span>
                </a>`).join('');
        } else {
            resultsContainer.innerHTML = '<p class="small text-muted">No results found</p>';
        }
    }
    
    /**
     * Initialize progress tracking
     */
    initializeProgressTracking() {
        // Add checkboxes to questions
        document.querySelectorAll('.card.border-primary').forEach(card => {
            const header = card.querySelector('.card-header');
            const checkbox = document.createElement('div');
            checkbox.className = 'form-check position-absolute top-50 end-0 translate-middle-y me-3';
            checkbox.innerHTML = `
                <input class="form-check-input" type="checkbox" id="check-${card.parentElement.id}">
                <label class="form-check-label visually-hidden" for="check-${card.parentElement.id}">
                    Mark as completed
                </label>`;
            header.style.position = 'relative';
            header.appendChild(checkbox);
            
            // Save state
            checkbox.querySelector('input').addEventListener('change', (e) => {
                this.saveProgress(card.parentElement.id, e.target.checked);
                this.updateProgressBar();
            });
        });
        
        // Load saved progress
        this.loadProgress();
        
        // Add progress bar
        this.addProgressBar();
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress(questionId, completed) {
        const progress = JSON.parse(localStorage.getItem('interviewProgress') || '{}');
        progress[questionId] = completed;
        localStorage.setItem('interviewProgress', JSON.stringify(progress));
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('interviewProgress') || '{}');
        Object.entries(progress).forEach(([questionId, completed]) => {
            const checkbox = document.querySelector(`#check-${questionId}`);
            if (checkbox) {
                checkbox.checked = completed;
            }
        });
    }
    
    /**
     * Add progress bar
     */
    addProgressBar() {
        const header = document.querySelector('.section-header');
        if (header) {
            const progressBar = document.createElement('div');
            progressBar.className = 'mt-3';
            progressBar.innerHTML = `
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar bg-success" role="progressbar" id="progressBar">
                        <span class="fw-bold">0% Complete</span>
                    </div>
                </div>`;
            header.appendChild(progressBar);
            this.updateProgressBar();
        }
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        const total = document.querySelectorAll('.card.border-primary').length;
        const completed = document.querySelectorAll('.card.border-primary input:checked').length;
        const percentage = Math.round((completed / total) * 100);
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
            progressBar.innerHTML = `<span class="fw-bold">${percentage}% Complete (${completed}/${total})</span>`;
        }
    }
    
    /**
     * Get section icon based on title
     */
    getSectionIcon(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('concept')) return 'bi-book';
        if (titleLower.includes('question')) return 'bi-question-circle';
        if (titleLower.includes('star') || titleLower.includes('stories')) return 'bi-star';
        if (titleLower.includes('coding')) return 'bi-code-slash';
        if (titleLower.includes('command')) return 'bi-terminal';
        return 'bi-folder';
    }
    
    /**
     * Get short title for navigation
     */
    getSectionShortTitle(title) {
        // Remove "SECTION X:" prefix if present
        return title.replace(/^SECTION \d+:\s*/i, '');
    }
}

// Export for use
window.ContentLoader = ContentLoader;