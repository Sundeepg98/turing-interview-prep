import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../../src/App';

describe('App', () => {
  let app;
  let mockContentManager;
  let mockSearchEngine;
  let mockThemeManager;
  let rootElement;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '<div id="app"></div>';
    rootElement = document.querySelector('#app');

    // Create mocks
    mockContentManager = {
      questions: [
        { id: '1', title: 'Test Question 1', category: 'Test', difficulty: 'easy' },
        { id: '2', title: 'Test Question 2', category: 'Test', difficulty: 'medium' }
      ],
      isCompleted: vi.fn(() => false),
      isBookmarked: vi.fn(() => false),
      markCompleted: vi.fn(),
      toggleBookmark: vi.fn(),
      trackAccess: vi.fn(),
      getStats: vi.fn(() => ({
        total: 2,
        completed: 0,
        bookmarked: 0,
        percentage: 0
      })),
      getQuestionById: vi.fn((id) => mockContentManager.questions.find(q => q.id === id)),
      getProgressPercentage: vi.fn(() => 0),
      resetProgress: vi.fn()
    };

    mockSearchEngine = {
      search: vi.fn(() => []),
      getHighlightedText: vi.fn((text) => text)
    };

    mockThemeManager = {
      getTheme: vi.fn(() => 'light'),
      toggleTheme: vi.fn(),
      setTheme: vi.fn()
    };

    app = new App({
      contentManager: mockContentManager,
      searchEngine: mockSearchEngine,
      themeManager: mockThemeManager
    });
  });

  describe('initialization', () => {
    it('should create app instance with dependencies', () => {
      expect(app.contentManager).toBe(mockContentManager);
      expect(app.searchEngine).toBe(mockSearchEngine);
      expect(app.themeManager).toBe(mockThemeManager);
      expect(app.currentView).toBe('questions');
    });
  });

  describe('mount', () => {
    it('should mount app to selector', async () => {
      await app.mount('#app');
      
      expect(app.rootElement).toBe(rootElement);
      expect(rootElement.innerHTML).toContain('Interview Prep Guide');
    });

    it('should throw error if selector not found', async () => {
      await expect(app.mount('#nonexistent')).rejects.toThrow('Element #nonexistent not found');
    });
  });

  describe('navigation', () => {
    beforeEach(async () => {
      await app.mount('#app');
    });

    it('should render questions view by default', () => {
      expect(rootElement.innerHTML).toContain('questions-list');
      expect(rootElement.innerHTML).toContain('Test Question 1');
      expect(rootElement.innerHTML).toContain('Test Question 2');
    });

    it('should switch to search view', () => {
      const searchButton = rootElement.querySelector('[data-view="search"]');
      searchButton.click();
      
      expect(app.currentView).toBe('search');
      expect(rootElement.innerHTML).toContain('search-container');
      expect(rootElement.innerHTML).toContain('search-input');
    });

    it('should switch to progress view', () => {
      const progressButton = rootElement.querySelector('[data-view="progress"]');
      progressButton.click();
      
      expect(app.currentView).toBe('progress');
      expect(rootElement.innerHTML).toContain('Your Progress');
      expect(rootElement.innerHTML).toContain('progress-bar');
    });

    it('should mark active navigation button', () => {
      const searchButton = rootElement.querySelector('[data-view="search"]');
      searchButton.click();
      
      // After re-render, need to query again
      const updatedSearchButton = rootElement.querySelector('[data-view="search"]');
      const questionsButton = rootElement.querySelector('[data-view="questions"]');
      
      expect(updatedSearchButton.classList.contains('active')).toBe(true);
      expect(questionsButton.classList.contains('active')).toBe(false);
    });
  });

  describe('theme toggle', () => {
    beforeEach(async () => {
      await app.mount('#app');
    });

    it('should toggle theme when button clicked', () => {
      const themeButton = rootElement.querySelector('.theme-toggle');
      themeButton.click();
      
      expect(mockThemeManager.toggleTheme).toHaveBeenCalled();
    });

    it('should update theme button icon', () => {
      const themeButton = rootElement.querySelector('.theme-toggle');
      expect(themeButton.textContent.trim()).toBe('🌙'); // Light theme shows moon
      
      mockThemeManager.getTheme.mockReturnValue('dark');
      themeButton.click();
      
      expect(themeButton.textContent.trim()).toBe('☀️'); // Dark theme shows sun
    });
  });

  describe('question interaction', () => {
    beforeEach(async () => {
      await app.mount('#app');
    });

    it('should show question modal when clicked', () => {
      const questionItem = rootElement.querySelector('.question-item');
      questionItem.click();
      
      const modal = document.querySelector('.question-modal');
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain('Test Question 1');
      expect(mockContentManager.trackAccess).toHaveBeenCalledWith('1');
    });

    it('should close modal when close button clicked', () => {
      const questionItem = rootElement.querySelector('.question-item');
      questionItem.click();
      
      const closeButton = document.querySelector('.close-button');
      closeButton.click();
      
      expect(document.querySelector('.question-modal')).toBeFalsy();
    });

    it('should toggle completion status', () => {
      const questionItem = rootElement.querySelector('.question-item');
      questionItem.click();
      
      const completeButton = document.querySelector('.complete-button');
      completeButton.click();
      
      expect(mockContentManager.markCompleted).toHaveBeenCalledWith('1');
    });

    it('should toggle bookmark status', () => {
      const questionItem = rootElement.querySelector('.question-item');
      questionItem.click();
      
      const bookmarkButton = document.querySelector('.bookmark-button');
      bookmarkButton.click();
      
      expect(mockContentManager.toggleBookmark).toHaveBeenCalledWith('1');
    });
  });

  describe('search functionality', () => {
    beforeEach(async () => {
      await app.mount('#app');
      // Switch to search view
      rootElement.querySelector('[data-view="search"]').click();
    });

    it('should perform search on input', () => {
      const searchInput = rootElement.querySelector('.search-input');
      searchInput.value = 'test query';
      searchInput.dispatchEvent(new Event('input'));
      
      expect(mockSearchEngine.search).toHaveBeenCalledWith('test query');
    });

    it('should show no results message', () => {
      const searchInput = rootElement.querySelector('.search-input');
      searchInput.value = 'test';
      searchInput.dispatchEvent(new Event('input'));
      
      expect(rootElement.innerHTML).toContain('No results found');
    });

    it('should show search results', () => {
      mockSearchEngine.search.mockReturnValue([
        { id: '1', title: 'Result 1', content: 'Content 1', category: 'Test' }
      ]);
      
      const searchInput = rootElement.querySelector('.search-input');
      searchInput.value = 'test';
      searchInput.dispatchEvent(new Event('input'));
      
      expect(rootElement.innerHTML).toContain('search-result-item');
      expect(mockSearchEngine.getHighlightedText).toHaveBeenCalled();
    });

    it('should clear results when search is empty', () => {
      const searchInput = rootElement.querySelector('.search-input');
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      
      expect(rootElement.querySelector('.search-results').innerHTML).toBe('');
    });
  });

  describe('progress functionality', () => {
    beforeEach(async () => {
      await app.mount('#app');
      // Switch to progress view
      rootElement.querySelector('[data-view="progress"]').click();
    });

    it('should display progress stats', () => {
      expect(rootElement.innerHTML).toContain('0%');
      expect(rootElement.innerHTML).toContain('Total Questions');
      expect(rootElement.innerHTML).toContain('Completed');
      expect(rootElement.innerHTML).toContain('Bookmarked');
    });

    it('should reset progress when button clicked', () => {
      const resetButton = rootElement.querySelector('.reset-progress');
      
      // Mock confirm
      window.confirm = vi.fn(() => true);
      
      resetButton.click();
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to reset all progress?');
      expect(mockContentManager.resetProgress).toHaveBeenCalled();
    });

    it('should not reset progress if cancelled', () => {
      const resetButton = rootElement.querySelector('.reset-progress');
      
      window.confirm = vi.fn(() => false);
      
      resetButton.click();
      
      expect(mockContentManager.resetProgress).not.toHaveBeenCalled();
    });
  });

  describe('renderView', () => {
    beforeEach(async () => {
      await app.mount('#app');
    });

    it('should render questions view', () => {
      app.currentView = 'questions';
      const html = app.renderView();
      expect(html).toContain('questions-container');
    });

    it('should render search view', () => {
      app.currentView = 'search';
      const html = app.renderView();
      expect(html).toContain('search-container');
    });

    it('should render progress view', () => {
      app.currentView = 'progress';
      const html = app.renderView();
      expect(html).toContain('progress-container');
    });

    it('should handle unknown view', () => {
      app.currentView = 'unknown';
      const html = app.renderView();
      expect(html).toBe('<div>View not found</div>');
    });
  });
});