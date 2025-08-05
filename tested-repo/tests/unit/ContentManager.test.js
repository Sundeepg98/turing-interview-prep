import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentManager } from '../../src/modules/ContentManager';

describe('ContentManager', () => {
  let contentManager;

  beforeEach(() => {
    contentManager = new ContentManager();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('loadQuestions', () => {
    it('should load questions from JSON file', async () => {
      const mockQuestions = [
        { id: '1', title: 'Test Question 1', content: 'Content 1' },
        { id: '2', title: 'Test Question 2', content: 'Content 2' }
      ];

      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions })
        })
      );

      const questions = await contentManager.loadQuestions();
      
      expect(fetch).toHaveBeenCalledWith('/content/questions.json');
      expect(questions).toEqual(mockQuestions);
      expect(contentManager.questions).toEqual(mockQuestions);
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const questions = await contentManager.loadQuestions();
      
      expect(questions).toEqual([]);
      expect(contentManager.questions).toEqual([]);
    });

    it('should cache loaded questions', async () => {
      const mockQuestions = [{ id: '1', title: 'Cached', content: 'Test' }];
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions })
        })
      );

      // First load
      await contentManager.loadQuestions();
      // Second load should use cache
      const cached = await contentManager.loadQuestions();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(cached).toEqual(mockQuestions);
    });
  });

  describe('getQuestionById', () => {
    beforeEach(async () => {
      contentManager.questions = [
        { id: '1', title: 'Question 1' },
        { id: '2', title: 'Question 2' }
      ];
    });

    it('should return question by ID', () => {
      const question = contentManager.getQuestionById('1');
      expect(question).toEqual({ id: '1', title: 'Question 1' });
    });

    it('should return undefined for non-existent ID', () => {
      const question = contentManager.getQuestionById('999');
      expect(question).toBeUndefined();
    });
  });

  describe('getQuestionsByCategory', () => {
    beforeEach(() => {
      contentManager.questions = [
        { id: '1', category: 'JavaScript' },
        { id: '2', category: 'React' },
        { id: '3', category: 'JavaScript' }
      ];
    });

    it('should filter questions by category', () => {
      const jsQuestions = contentManager.getQuestionsByCategory('JavaScript');
      expect(jsQuestions).toHaveLength(2);
      expect(jsQuestions[0].category).toBe('JavaScript');
      expect(jsQuestions[1].category).toBe('JavaScript');
    });

    it('should return empty array for non-existent category', () => {
      const questions = contentManager.getQuestionsByCategory('Python');
      expect(questions).toEqual([]);
    });
  });

  describe('progress tracking', () => {
    beforeEach(() => {
      // Reset progress before each test
      contentManager.resetProgress();
    });

    it('should mark question as completed', () => {
      contentManager.markCompleted('1');
      
      expect(contentManager.isCompleted('1')).toBe(true);
      expect(localStorage.getItem('progress')).toContain('"completed":["1"]');
    });

    it('should unmark completed question', () => {
      contentManager.markCompleted('1');
      contentManager.markCompleted('1'); // Toggle off
      
      expect(contentManager.isCompleted('1')).toBe(false);
    });

    it('should bookmark question', () => {
      contentManager.toggleBookmark('1');
      
      expect(contentManager.isBookmarked('1')).toBe(true);
      expect(localStorage.getItem('progress')).toContain('"bookmarked":["1"]');
    });

    it('should unbookmark question', () => {
      contentManager.toggleBookmark('1');
      contentManager.toggleBookmark('1'); // Toggle off
      
      expect(contentManager.isBookmarked('1')).toBe(false);
    });

    it('should track last accessed question', () => {
      const before = Date.now();
      contentManager.trackAccess('1');
      const after = Date.now();
      
      const progress = JSON.parse(localStorage.getItem('progress'));
      const timestamp = new Date(progress.lastAccessed['1']).getTime();
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should calculate progress percentage', () => {
      contentManager.questions = [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }
      ];
      
      contentManager.resetProgress(); // Reset to ensure 0%
      expect(contentManager.getProgressPercentage()).toBe(0);
      
      contentManager.markCompleted('1');
      expect(contentManager.getProgressPercentage()).toBe(25);
      
      contentManager.markCompleted('2');
      expect(contentManager.getProgressPercentage()).toBe(50);
    });

    it('should persist and restore progress', () => {
      contentManager.markCompleted('1');
      contentManager.toggleBookmark('2');
      
      // Create new instance
      const newManager = new ContentManager();
      
      expect(newManager.isCompleted('1')).toBe(true);
      expect(newManager.isBookmarked('2')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      contentManager.questions = [
        { id: '1', category: 'JavaScript', difficulty: 'easy' },
        { id: '2', category: 'React', difficulty: 'medium' },
        { id: '3', category: 'JavaScript', difficulty: 'hard' },
        { id: '4', category: 'TypeScript', difficulty: 'medium' }
      ];
      
      contentManager.resetProgress(); // Reset before testing
      contentManager.markCompleted('1');
      contentManager.markCompleted('2');
      contentManager.toggleBookmark('3');
      
      const stats = contentManager.getStats();
      
      expect(stats).toEqual({
        total: 4,
        completed: 2,
        bookmarked: 1,
        percentage: 50,
        byCategory: {
          JavaScript: { total: 2, completed: 1 },
          React: { total: 1, completed: 1 },
          TypeScript: { total: 1, completed: 0 }
        },
        byDifficulty: {
          easy: { total: 1, completed: 1 },
          medium: { total: 2, completed: 1 },
          hard: { total: 1, completed: 0 }
        }
      });
    });
  });
});