// Main JavaScript for Interview Guide

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize progress tracking
    initProgressTracking();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Initialize dark mode
    initDarkMode();
});

// Progress Tracking
function initProgressTracking() {
    const questions = document.querySelectorAll('.question-section');
    const totalQuestions = questions.length;
    let answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions') || '[]');
    
    // Add checkboxes to each question
    questions.forEach((question, index) => {
        const questionId = question.id;
        const header = question.querySelector('.question-header');
        
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check position-absolute top-0 end-0 m-3';
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" id="check-${questionId}" 
                   ${answeredQuestions.includes(questionId) ? 'checked' : ''}>
            <label class="form-check-label" for="check-${questionId}">
                Completed
            </label>
        `;
        
        header.appendChild(checkbox);
        
        // Handle checkbox change
        checkbox.querySelector('input').addEventListener('change', function() {
            if (this.checked) {
                if (!answeredQuestions.includes(questionId)) {
                    answeredQuestions.push(questionId);
                }
            } else {
                answeredQuestions = answeredQuestions.filter(id => id !== questionId);
            }
            
            localStorage.setItem('answeredQuestions', JSON.stringify(answeredQuestions));
            updateProgressBar();
        });
    });
    
    updateProgressBar();
    
    function updateProgressBar() {
        const progress = (answeredQuestions.length / totalQuestions) * 100;
        
        // Create progress bar if it doesn't exist
        let progressBar = document.getElementById('overallProgress');
        if (!progressBar) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'position-fixed bottom-0 start-0 end-0 p-3 bg-white shadow';
            progressContainer.style.zIndex = '999';
            progressContainer.innerHTML = `
                <div class="container">
                    <div class="d-flex align-items-center">
                        <span class="me-3">Progress: ${answeredQuestions.length}/${totalQuestions}</span>
                        <div class="progress flex-grow-1">
                            <div id="overallProgress" class="progress-bar bg-success" role="progressbar" 
                                 style="width: ${progress}%">
                                ${Math.round(progress)}%
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-secondary ms-3" onclick="resetProgress()">
                            Reset
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(progressContainer);
        } else {
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.round(progress) + '%';
            progressBar.parentElement.previousElementSibling.textContent = 
                `Progress: ${answeredQuestions.length}/${totalQuestions}`;
        }
    }
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset your progress?')) {
        localStorage.removeItem('answeredQuestions');
        document.querySelectorAll('.question-section input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        location.reload();
    }
}

// Search functionality
function initSearch() {
    // Create search bar
    const navbar = document.querySelector('.navbar-nav');
    const searchItem = document.createElement('li');
    searchItem.className = 'nav-item ms-3';
    searchItem.innerHTML = `
        <form class="d-flex" id="searchForm">
            <input class="form-control me-2" type="search" placeholder="Search questions..." 
                   aria-label="Search" id="searchInput">
            <button class="btn btn-outline-primary" type="submit">
                <i class="bi bi-search"></i>
            </button>
        </form>
    `;
    navbar.appendChild(searchItem);
    
    // Handle search
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    document.getElementById('searchInput').addEventListener('input', function() {
        if (this.value.length > 2) {
            performSearch();
        } else if (this.value.length === 0) {
            clearSearch();
        }
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const questions = document.querySelectorAll('.question-section');
    let found = 0;
    
    questions.forEach(question => {
        const content = question.textContent.toLowerCase();
        if (content.includes(searchTerm)) {
            question.style.display = '';
            // Highlight search term
            highlightText(question, searchTerm);
            found++;
        } else {
            question.style.display = 'none';
        }
    });
    
    // Show search results count
    showSearchResults(found);
}

function clearSearch() {
    document.querySelectorAll('.question-section').forEach(q => {
        q.style.display = '';
    });
    removeHighlights();
    hideSearchResults();
}

function highlightText(element, searchTerm) {
    // Remove existing highlights
    removeHighlights(element);
    
    // Skip code blocks
    const textNodes = getTextNodes(element);
    textNodes.forEach(node => {
        const text = node.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        if (regex.test(text)) {
            const span = document.createElement('span');
            span.innerHTML = text.replace(regex, '<mark class="bg-warning">$1</mark>');
            node.parentNode.replaceChild(span, node);
        }
    });
}

function removeHighlights(element = document) {
    element.querySelectorAll('mark').forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip code blocks and script tags
                if (node.parentNode.closest('pre, code, script')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    return textNodes;
}

function showSearchResults(count) {
    let resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'searchResults';
        resultsDiv.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-5';
        resultsDiv.style.zIndex = '1050';
        document.body.appendChild(resultsDiv);
    }
    
    resultsDiv.innerHTML = `
        Found ${count} question${count !== 1 ? 's' : ''} matching your search.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
}

function hideSearchResults() {
    const resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) {
        resultsDiv.remove();
    }
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            clearSearch();
            document.getElementById('searchInput').value = '';
        }
        
        // J/K for navigation
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            if (e.key === 'j') {
                navigateQuestions('next');
            } else if (e.key === 'k') {
                navigateQuestions('prev');
            }
        }
    });
}

function navigateQuestions(direction) {
    const questions = Array.from(document.querySelectorAll('.question-section:not([style*="none"])'));
    const currentQuestion = questions.find(q => {
        const rect = q.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= window.innerHeight / 2;
    });
    
    if (currentQuestion) {
        const currentIndex = questions.indexOf(currentQuestion);
        let targetIndex;
        
        if (direction === 'next') {
            targetIndex = Math.min(currentIndex + 1, questions.length - 1);
        } else {
            targetIndex = Math.max(currentIndex - 1, 0);
        }
        
        questions[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Dark mode
function initDarkMode() {
    const darkModeToggle = document.createElement('div');
    darkModeToggle.className = 'position-fixed top-0 end-0 m-3';
    darkModeToggle.style.zIndex = '1040';
    darkModeToggle.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary" id="darkModeToggle" 
                title="Toggle dark mode">
            <i class="bi bi-moon"></i>
        </button>
    `;
    document.body.appendChild(darkModeToggle);
    
    // Check saved preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        enableDarkMode();
    }
    
    document.getElementById('darkModeToggle').addEventListener('click', function() {
        const isDark = document.body.classList.contains('dark-mode');
        if (isDark) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').innerHTML = '<i class="bi bi-sun"></i>';
    localStorage.setItem('darkMode', 'true');
    
    // Add dark mode styles
    if (!document.getElementById('darkModeStyles')) {
        const style = document.createElement('style');
        style.id = 'darkModeStyles';
        style.innerHTML = `
            .dark-mode {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            .dark-mode .navbar,
            .dark-mode .card,
            .dark-mode .question-section,
            .dark-mode .toc-section {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
            }
            .dark-mode .list-group-item {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #3a3a3a !important;
            }
            .dark-mode .list-group-item:hover {
                background-color: #3a3a3a !important;
            }
            .dark-mode pre {
                background-color: #1e1e1e !important;
            }
            .dark-mode .explanation-box,
            .dark-mode .understanding-box,
            .dark-mode .case-study-box {
                background-color: #2a2a2a !important;
                border-color: #3a3a3a !important;
            }
            .dark-mode .text-muted {
                color: #a0a0a0 !important;
            }
        `;
        document.head.appendChild(style);
    }
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    document.getElementById('darkModeToggle').innerHTML = '<i class="bi bi-moon"></i>';
    localStorage.setItem('darkMode', 'false');
}

// Export functions for global use
window.resetProgress = resetProgress;