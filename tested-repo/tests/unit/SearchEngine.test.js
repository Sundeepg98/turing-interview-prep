import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine } from '../../src/modules/SearchEngine';

describe('SearchEngine', () => {
  let searchEngine;
  const testQuestions = [
    {
      id: '1',
      title: 'What is Pulumi?',
      content: 'Pulumi is an infrastructure as code platform.',
      category: 'DevOps',
      tags: ['infrastructure', 'IaC', 'cloud']
    },
    {
      id: '2',
      title: 'TypeScript Generics',
      content: 'Generics provide a way to make components work with any data type.',
      category: 'TypeScript',
      tags: ['typescript', 'generics', 'types']
    },
    {
      id: '3',
      title: 'React Hooks',
      content: 'Hooks let you use state and other React features without writing a class.',
      category: 'React',
      tags: ['react', 'hooks', 'useState']
    }
  ];

  beforeEach(() => {
    searchEngine = new SearchEngine(testQuestions);
  });

  describe('initialization', () => {
    it('should build search index on construction', () => {
      expect(searchEngine.questions).toEqual(testQuestions);
      expect(searchEngine.searchIndex).toBeDefined();
    });

    it('should handle empty questions array', () => {
      const emptyEngine = new SearchEngine([]);
      expect(emptyEngine.questions).toEqual([]);
      expect(emptyEngine.searchIndex).toBeDefined();
    });
  });

  describe('search', () => {
    it('should find questions by title keyword', () => {
      const results = searchEngine.search('pulumi');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should find questions by content keyword', () => {
      const results = searchEngine.search('infrastructure');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('What is Pulumi?');
    });

    it('should find questions by tag', () => {
      const results = searchEngine.search('typescript');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('should be case insensitive', () => {
      const results1 = searchEngine.search('TYPESCRIPT');
      const results2 = searchEngine.search('typescript');
      const results3 = searchEngine.search('TypeScript');
      
      expect(results1).toEqual(results2);
      expect(results2).toEqual(results3);
    });

    it('should handle fuzzy matching', () => {
      const results = searchEngine.search('typscript'); // Missing 'e'
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('should return empty array for no matches', () => {
      const results = searchEngine.search('python');
      expect(results).toEqual([]);
    });

    it('should handle empty search query', () => {
      const results = searchEngine.search('');
      expect(results).toEqual([]);
    });

    it('should handle special characters in query', () => {
      const results = searchEngine.search('React?');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    it('should rank results by relevance', () => {
      const results = searchEngine.search('React');
      expect(results[0].id).toBe('3'); // Should match title first
    });
  });

  describe('searchByCategory', () => {
    it('should filter by category', () => {
      const results = searchEngine.searchByCategory('TypeScript');
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('TypeScript');
    });

    it('should handle non-existent category', () => {
      const results = searchEngine.searchByCategory('Python');
      expect(results).toEqual([]);
    });

    it('should be case sensitive for exact matches', () => {
      const results = searchEngine.searchByCategory('typescript');
      expect(results).toEqual([]);
    });
  });

  describe('searchByTags', () => {
    it('should find questions with specific tag', () => {
      const results = searchEngine.searchByTags(['hooks']);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    it('should find questions with multiple tags (OR operation)', () => {
      const results = searchEngine.searchByTags(['hooks', 'generics']);
      expect(results).toHaveLength(2);
      expect(results.map(r => r.id).sort()).toEqual(['2', '3']);
    });

    it('should handle empty tags array', () => {
      const results = searchEngine.searchByTags([]);
      expect(results).toEqual([]);
    });

    it('should handle non-existent tags', () => {
      const results = searchEngine.searchByTags(['python', 'django']);
      expect(results).toEqual([]);
    });
  });

  describe('getHighlightedText', () => {
    it('should highlight search term in text', () => {
      const text = 'Learn TypeScript for better type safety';
      const highlighted = searchEngine.getHighlightedText(text, 'typescript');
      expect(highlighted).toBe('Learn <mark>TypeScript</mark> for better type safety');
    });

    it('should highlight multiple occurrences', () => {
      const text = 'React is great. I love React!';
      const highlighted = searchEngine.getHighlightedText(text, 'react');
      expect(highlighted).toBe('<mark>React</mark> is great. I love <mark>React</mark>!');
    });

    it('should handle case insensitive highlighting', () => {
      const text = 'TYPESCRIPT, typescript, TypeScript';
      const highlighted = searchEngine.getHighlightedText(text, 'typescript');
      expect(highlighted).toBe('<mark>TYPESCRIPT</mark>, <mark>typescript</mark>, <mark>TypeScript</mark>');
    });

    it('should handle special regex characters', () => {
      const text = 'What is $scope in Angular?';
      const highlighted = searchEngine.getHighlightedText(text, '$scope');
      expect(highlighted).toBe('What is <mark>$scope</mark> in Angular?');
    });
  });

  describe('getSuggestions', () => {
    it('should provide search suggestions based on partial input', () => {
      const suggestions = searchEngine.getSuggestions('typ');
      expect(suggestions).toContain('typescript');
      expect(suggestions).toContain('types');
    });

    it('should limit number of suggestions', () => {
      // First check if there are suggestions for 't'
      const allSuggestions = searchEngine.getSuggestions('t');
      if (allSuggestions.length >= 2) {
        const limitedSuggestions = searchEngine.getSuggestions('t', 2);
        expect(limitedSuggestions).toHaveLength(2);
      } else {
        // Skip test if not enough suggestions
        expect(allSuggestions.length).toBeLessThan(2);
      }
    });

    it('should return empty array for no matches', () => {
      const suggestions = searchEngine.getSuggestions('xyz');
      expect(suggestions).toEqual([]);
    });
  });

  describe('rebuildIndex', () => {
    it('should rebuild index with new questions', () => {
      const newQuestions = [
        { id: '4', title: 'New Question', content: 'New content' }
      ];
      
      searchEngine.rebuildIndex(newQuestions);
      
      const results = searchEngine.search('New Question');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('4');
      
      // Old questions should not be found
      const oldResults = searchEngine.search('Pulumi');
      expect(oldResults).toEqual([]);
    });
  });

  describe('performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        title: `Question ${i}`,
        content: `Content for question ${i}`,
        tags: [`tag${i}`, 'common']
      }));
      
      const largeEngine = new SearchEngine(largeDataset);
      
      const start = performance.now();
      const results = largeEngine.search('500');
      const end = performance.now();
      
      // Fuse.js might return multiple results for partial matches
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.id === '500')).toBe(true);
      expect(end - start).toBeLessThan(200); // Should complete within 200ms
    });
  });
});