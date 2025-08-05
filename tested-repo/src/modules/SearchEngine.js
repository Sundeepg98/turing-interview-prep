import Fuse from 'fuse.js';

export class SearchEngine {
  constructor(questions) {
    this.questions = questions;
    this.buildIndex();
  }

  buildIndex() {
    // Configure Fuse.js for fuzzy search
    const options = {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'content', weight: 0.3 },
        { name: 'tags', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
      shouldSort: true
    };

    this.searchIndex = new Fuse(this.questions, options);
  }

  search(query) {
    if (!query || query.trim() === '') {
      return [];
    }

    const results = this.searchIndex.search(query);
    return results.map(result => result.item);
  }

  searchByCategory(category) {
    return this.questions.filter(q => q.category === category);
  }

  searchByTags(tags) {
    if (!tags || tags.length === 0) {
      return [];
    }

    return this.questions.filter(question => {
      if (!question.tags) return false;
      return tags.some(tag => question.tags.includes(tag));
    });
  }

  getHighlightedText(text, searchTerm) {
    if (!searchTerm) return text;

    // Escape special regex characters
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    
    return text.replace(regex, '<mark>$1</mark>');
  }

  getSuggestions(partial, limit = 5) {
    if (!partial || partial.length < 2) {
      return [];
    }

    const suggestions = new Set();
    const lowerPartial = partial.toLowerCase();

    // Search through all indexed fields
    this.questions.forEach(question => {
      // Check title
      if (question.title && question.title.toLowerCase().includes(lowerPartial)) {
        const words = question.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.startsWith(lowerPartial)) {
            suggestions.add(word);
          }
        });
      }

      // Check tags
      if (question.tags) {
        question.tags.forEach(tag => {
          if (tag.toLowerCase().startsWith(lowerPartial)) {
            suggestions.add(tag.toLowerCase());
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  rebuildIndex(newQuestions) {
    this.questions = newQuestions;
    this.buildIndex();
  }

  // Advanced search with filters
  advancedSearch(options) {
    let results = this.questions;

    // Apply text search if query provided
    if (options.query) {
      const searchResults = this.search(options.query);
      const searchIds = new Set(searchResults.map(r => r.id));
      results = results.filter(q => searchIds.has(q.id));
    }

    // Filter by category
    if (options.category) {
      results = results.filter(q => q.category === options.category);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter(q => {
        if (!q.tags) return false;
        return options.tags.some(tag => q.tags.includes(tag));
      });
    }

    // Filter by difficulty
    if (options.difficulty) {
      results = results.filter(q => q.difficulty === options.difficulty);
    }

    // Sort results
    if (options.sortBy) {
      results.sort((a, b) => {
        switch (options.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty': {
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        }
        default:
          return 0;
        }
      });
    }

    return results;
  }
}