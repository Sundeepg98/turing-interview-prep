export class App {
  constructor({ contentManager, searchEngine, themeManager }) {
    this.contentManager = contentManager;
    this.searchEngine = searchEngine;
    this.themeManager = themeManager;
    this.currentView = 'questions';
    this.rootElement = null;
  }

  async mount(selector) {
    this.rootElement = document.querySelector(selector);
    if (!this.rootElement) {
      throw new Error(`Element ${selector} not found`);
    }

    this.render();
    this.attachEventListeners();
  }

  render() {
    this.rootElement.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>Interview Prep Guide</h1>
          <nav>
            <button data-view="questions" class="${this.currentView === 'questions' ? 'active' : ''}">Questions</button>
            <button data-view="search" class="${this.currentView === 'search' ? 'active' : ''}">Search</button>
            <button data-view="progress" class="${this.currentView === 'progress' ? 'active' : ''}">Progress</button>
          </nav>
          <button aria-label="Toggle theme" class="theme-toggle">
            ${this.themeManager.getTheme() === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>
        
        <main class="app-main">
          ${this.renderView()}
        </main>
      </div>
    `;
  }

  renderView() {
    switch (this.currentView) {
    case 'questions':
      return this.renderQuestions();
    case 'search':
      return this.renderSearch();
    case 'progress':
      return this.renderProgress();
    default:
      return '<div>View not found</div>';
    }
  }

  renderQuestions() {
    const questions = this.contentManager.questions;
    
    return `
      <div class="questions-container">
        <div class="questions-list">
          ${questions.map(q => `
            <div class="question-item" data-id="${q.id}">
              <h3>${q.title}</h3>
              <div class="question-meta">
                <span class="question-category">${q.category}</span>
                <span class="question-difficulty difficulty-${q.difficulty}">${q.difficulty}</span>
                ${this.contentManager.isCompleted(q.id) ? '<span class="completed">✓</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderSearch() {
    return `
      <div class="search-container">
        <div class="search-box">
          <input type="search" 
                 placeholder="Search questions..." 
                 class="search-input"
                 value="${this.lastSearch || ''}">
          <button aria-label="Clear search" class="clear-search">✕</button>
        </div>
        <div class="search-results"></div>
      </div>
    `;
  }

  renderProgress() {
    const stats = this.contentManager.getStats();
    
    return `
      <div class="progress-container">
        <h2>Your Progress</h2>
        
        <div class="progress-overview">
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
          </div>
          <div class="progress-percentage">${stats.percentage}%</div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Questions</h3>
            <div class="stat-value">${stats.total}</div>
          </div>
          <div class="stat-card">
            <h3>Completed</h3>
            <div class="stat-value">${stats.completed}</div>
          </div>
          <div class="stat-card">
            <h3>Bookmarked</h3>
            <div class="stat-value">${stats.bookmarked}</div>
          </div>
        </div>
        
        <button class="reset-progress">Reset Progress</button>
      </div>
    `;
  }

  attachEventListeners() {
    // Navigation
    this.rootElement.addEventListener('click', (e) => {
      if (e.target.matches('[data-view]')) {
        this.currentView = e.target.dataset.view;
        this.render();
        this.attachEventListeners();
      }
    });

    // Theme toggle
    this.rootElement.addEventListener('click', (e) => {
      if (e.target.matches('.theme-toggle')) {
        this.themeManager.toggleTheme();
        e.target.textContent = this.themeManager.getTheme() === 'dark' ? '☀️' : '🌙';
      }
    });

    // Question clicks
    this.rootElement.addEventListener('click', (e) => {
      const questionItem = e.target.closest('.question-item');
      if (questionItem) {
        const questionId = questionItem.dataset.id;
        this.showQuestion(questionId);
      }
    });

    // Search functionality
    const searchInput = this.rootElement.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });
    }

    // Reset progress
    this.rootElement.addEventListener('click', (e) => {
      if (e.target.matches('.reset-progress')) {
        if (confirm('Are you sure you want to reset all progress?')) {
          this.contentManager.resetProgress();
          this.render();
          this.attachEventListeners();
        }
      }
    });
  }

  showQuestion(questionId) {
    const question = this.contentManager.getQuestionById(questionId);
    if (!question) return;

    this.contentManager.trackAccess(questionId);

    const modal = document.createElement('div');
    modal.className = 'question-modal';
    modal.innerHTML = `
      <div class="question-detail">
        <button class="close-button">✕</button>
        <h2 class="question-title">${question.title}</h2>
        <div class="question-content">${question.content}</div>
        <div class="question-actions">
          <button class="complete-button ${this.contentManager.isCompleted(questionId) ? 'completed' : ''}">
            ${this.contentManager.isCompleted(questionId) ? 'Completed' : 'Mark Complete'}
          </button>
          <button class="bookmark-button ${this.contentManager.isBookmarked(questionId) ? 'bookmarked' : ''}" 
                  aria-label="Bookmark">
            ${this.contentManager.isBookmarked(questionId) ? '★' : '☆'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners for modal
    modal.addEventListener('click', (e) => {
      if (e.target.matches('.close-button') || e.target === modal) {
        modal.remove();
      }
      
      if (e.target.matches('.complete-button')) {
        this.contentManager.markCompleted(questionId);
        e.target.classList.toggle('completed');
        e.target.textContent = this.contentManager.isCompleted(questionId) ? 'Completed' : 'Mark Complete';
        this.render();
        this.attachEventListeners();
      }
      
      if (e.target.matches('.bookmark-button')) {
        this.contentManager.toggleBookmark(questionId);
        e.target.classList.toggle('bookmarked');
        e.target.textContent = this.contentManager.isBookmarked(questionId) ? '★' : '☆';
      }
    });
  }

  performSearch(query) {
    this.lastSearch = query;
    const resultsContainer = this.rootElement.querySelector('.search-results');
    
    if (!query.trim()) {
      resultsContainer.innerHTML = '';
      return;
    }

    const results = this.searchEngine.search(query);
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
      return;
    }

    resultsContainer.innerHTML = `
      <div class="search-results-list">
        ${results.map(q => `
          <div class="search-result-item" data-id="${q.id}">
            <h4>${this.searchEngine.getHighlightedText(q.title, query)}</h4>
            <p>${this.searchEngine.getHighlightedText(q.content.substring(0, 150) + '...', query)}</p>
            <div class="result-meta">
              <span class="result-category">${q.category}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}