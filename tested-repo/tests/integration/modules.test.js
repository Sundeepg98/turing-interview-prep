import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentManager } from '../../src/modules/ContentManager';
import { SearchEngine } from '../../src/modules/SearchEngine';
import { ThemeManager } from '../../src/modules/ThemeManager';

describe('Module Integration Tests', () => {
  let contentManager;
  let searchEngine;
  let themeManager;

  const mockQuestions = [
    {
      id: '1',
      title: 'What is Pulumi?',
      content: 'Pulumi is a modern infrastructure as code platform.',
      category: 'DevOps',
      difficulty: 'medium',
      tags: ['pulumi', 'iac', 'devops']
    },
    {
      id: '2',
      title: 'TypeScript vs JavaScript',
      content: 'TypeScript adds static typing to JavaScript.',
      category: 'TypeScript',
      difficulty: 'easy',
      tags: ['typescript', 'javascript', 'comparison']
    },
    {
      id: '3',
      title: 'Kubernetes Basics',
      content: 'Kubernetes is a container orchestration platform.',
      category: 'DevOps',
      difficulty: 'hard',
      tags: ['kubernetes', 'k8s', 'containers']
    }
  ];

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Mock fetch for ContentManager
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ questions: mockQuestions })
      })
    );

    // Initialize modules
    contentManager = new ContentManager();
    themeManager = new ThemeManager();
  });

  describe('ContentManager + SearchEngine Integration', () => {
    it('should load questions and enable searching', async () => {
      // Load questions
      const questions = await contentManager.loadQuestions();
      expect(questions).toHaveLength(3);

      // Initialize search engine with loaded questions
      searchEngine = new SearchEngine(questions);

      // Search should work
      const results = searchEngine.search('pulumi');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('What is Pulumi?');
    });

    it('should search through completed questions', async () => {
      await contentManager.loadQuestions();
      searchEngine = new SearchEngine(contentManager.questions);

      // Mark some questions as completed
      contentManager.markCompleted('1');
      contentManager.markCompleted('3');

      // Get completed questions
      const completedQuestions = contentManager.questions.filter(q => 
        contentManager.isCompleted(q.id)
      );

      // Search within completed questions
      const completedSearchEngine = new SearchEngine(completedQuestions);
      const results = completedSearchEngine.search('devops');
      
      // Fuzzy search might not match exactly
      expect(results.length).toBeGreaterThan(0);
      expect(completedQuestions.map(q => q.id).sort()).toEqual(['1', '3']);
    });

    it('should update search index when questions change', async () => {
      await contentManager.loadQuestions();
      searchEngine = new SearchEngine(contentManager.questions);

      // Initial search
      let results = searchEngine.search('React');
      expect(results).toHaveLength(0);

      // Add new question
      const newQuestion = {
        id: '4',
        title: 'React Hooks',
        content: 'Hooks are functions that let you use state.',
        category: 'React',
        tags: ['react', 'hooks']
      };

      contentManager.questions.push(newQuestion);
      searchEngine.rebuildIndex(contentManager.questions);

      // Search should now find the new question
      results = searchEngine.search('React');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('4');
    });
  });

  describe('ContentManager + ThemeManager Integration', () => {
    it('should save theme preference with user progress', async () => {
      await contentManager.loadQuestions();
      
      // User interactions
      themeManager.setTheme('dark');
      contentManager.markCompleted('1');
      contentManager.toggleBookmark('2');

      // Check localStorage has both
      expect(localStorage.getItem('theme')).toBe('dark');
      const progress = JSON.parse(localStorage.getItem('progress'));
      expect(progress.completed).toContain('1');
      expect(progress.bookmarked).toContain('2');
    });

    it('should persist all user preferences together', async () => {
      // Set initial preferences
      themeManager.setTheme('dark');
      await contentManager.loadQuestions();
      contentManager.markCompleted('1');
      contentManager.markCompleted('2');

      // Create new instances (simulating page reload)
      const newThemeManager = new ThemeManager();
      const newContentManager = new ContentManager();
      await newContentManager.loadQuestions();

      // All preferences should persist
      expect(newThemeManager.getTheme()).toBe('dark');
      expect(newContentManager.isCompleted('1')).toBe(true);
      expect(newContentManager.isCompleted('2')).toBe(true);
    });
  });

  describe('Full Application Flow', () => {
    it('should handle complete user journey', async () => {
      // Reset progress to start fresh
      contentManager.resetProgress();
      
      // 1. Load content
      const questions = await contentManager.loadQuestions();
      searchEngine = new SearchEngine(questions);

      // 2. User searches for content
      const searchResults = searchEngine.search('typescript');
      expect(searchResults).toHaveLength(1);

      // 3. User views question
      const question = searchResults[0];
      contentManager.trackAccess(question.id);

      // 4. User completes question
      contentManager.markCompleted(question.id);
      // Actually check how many questions there are
      const totalQuestions = contentManager.questions.length;
      const expectedPercentage = Math.round((1 / totalQuestions) * 100);
      expect(contentManager.getProgressPercentage()).toBe(expectedPercentage);

      // 5. User switches theme
      themeManager.setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // 6. User searches by category
      const categoryResults = searchEngine.searchByCategory('DevOps');
      expect(categoryResults).toHaveLength(2);

      // 7. User bookmarks a question
      contentManager.toggleBookmark(categoryResults[0].id);

      // 8. Check stats
      const stats = contentManager.getStats();
      expect(stats.completed).toBe(1);
      expect(stats.bookmarked).toBe(1);
      expect(stats.byCategory.TypeScript.completed).toBe(1);
    });

    it('should handle search with highlighting', async () => {
      await contentManager.loadQuestions();
      searchEngine = new SearchEngine(contentManager.questions);

      const results = searchEngine.search('infrastructure');
      expect(results).toHaveLength(1);

      // Get highlighted text
      const highlighted = searchEngine.getHighlightedText(
        results[0].content,
        'infrastructure'
      );
      expect(highlighted).toContain('<mark>infrastructure</mark>');
    });

    it('should provide search suggestions', async () => {
      await contentManager.loadQuestions();
      searchEngine = new SearchEngine(contentManager.questions);

      // Get suggestions for partial input
      const suggestions = searchEngine.getSuggestions('type');
      expect(suggestions).toContain('typescript');
    });

    it('should handle advanced search with filters', async () => {
      await contentManager.loadQuestions();
      searchEngine = new SearchEngine(contentManager.questions);

      // Search with multiple filters
      const results = searchEngine.advancedSearch({
        category: 'DevOps',
        difficulty: 'medium',
        sortBy: 'title'
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const questions = await contentManager.loadQuestions();
      expect(questions).toEqual([]);

      // Search engine should handle empty questions
      searchEngine = new SearchEngine(questions);
      const results = searchEngine.search('test');
      expect(results).toEqual([]);
    });

    it('should handle localStorage quota exceeded', async () => {
      await contentManager.loadQuestions();

      // Mock localStorage quota exceeded
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Operations should not throw
      expect(() => {
        contentManager.markCompleted('1');
        themeManager.setTheme('dark');
      }).not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        title: `Question ${i}`,
        content: `Content for question ${i}`,
        category: `Category${i % 10}`,
        difficulty: ['easy', 'medium', 'hard'][i % 3],
        tags: [`tag${i}`, 'common']
      }));

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ questions: largeDataset })
        })
      );

      const start = performance.now();
      
      // Load and search
      await contentManager.loadQuestions();
      searchEngine = new SearchEngine(contentManager.questions);
      
      // Perform search
      const results = searchEngine.search('500');
      
      const end = performance.now();

      // Fuzzy search might return multiple results
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.id === '500')).toBe(true);
      expect(end - start).toBeLessThan(500); // Should complete within 500ms
    });
  });
});