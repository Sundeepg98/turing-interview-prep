export class ContentManager {
  constructor() {
    this.questions = [];
    this.progress = this.loadProgress();
  }

  async loadQuestions() {
    if (this.questions.length > 0) {
      return this.questions;
    }

    try {
      const response = await fetch('/content/questions.json');
      const data = await response.json();
      this.questions = data.questions;
      return this.questions;
    } catch (error) {
      console.error('Failed to load questions:', error);
      return [];
    }
  }

  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  }

  getQuestionsByCategory(category) {
    return this.questions.filter(q => q.category === category);
  }

  markCompleted(questionId) {
    if (this.isCompleted(questionId)) {
      this.progress.completed = this.progress.completed.filter(id => id !== questionId);
    } else {
      this.progress.completed.push(questionId);
    }
    this.saveProgress();
  }

  isCompleted(questionId) {
    return this.progress.completed.includes(questionId);
  }

  toggleBookmark(questionId) {
    if (this.isBookmarked(questionId)) {
      this.progress.bookmarked = this.progress.bookmarked.filter(id => id !== questionId);
    } else {
      this.progress.bookmarked.push(questionId);
    }
    this.saveProgress();
  }

  isBookmarked(questionId) {
    return this.progress.bookmarked.includes(questionId);
  }

  trackAccess(questionId) {
    this.progress.lastAccessed[questionId] = new Date().toISOString();
    this.saveProgress();
  }

  getProgressPercentage() {
    if (this.questions.length === 0) return 0;
    return Math.round((this.progress.completed.length / this.questions.length) * 100);
  }

  getStats() {
    const stats = {
      total: this.questions.length,
      completed: this.progress.completed.length,
      bookmarked: this.progress.bookmarked.length,
      percentage: this.getProgressPercentage(),
      byCategory: {},
      byDifficulty: {}
    };

    // Calculate stats by category
    this.questions.forEach(question => {
      // By category
      if (!stats.byCategory[question.category]) {
        stats.byCategory[question.category] = { total: 0, completed: 0 };
      }
      stats.byCategory[question.category].total++;
      if (this.isCompleted(question.id)) {
        stats.byCategory[question.category].completed++;
      }

      // By difficulty
      if (question.difficulty) {
        if (!stats.byDifficulty[question.difficulty]) {
          stats.byDifficulty[question.difficulty] = { total: 0, completed: 0 };
        }
        stats.byDifficulty[question.difficulty].total++;
        if (this.isCompleted(question.id)) {
          stats.byDifficulty[question.difficulty].completed++;
        }
      }
    });

    return stats;
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('progress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }

    return {
      completed: [],
      bookmarked: [],
      lastAccessed: {}
    };
  }

  saveProgress() {
    try {
      localStorage.setItem('progress', JSON.stringify(this.progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  resetProgress() {
    this.progress = {
      completed: [],
      bookmarked: [],
      lastAccessed: {}
    };
    this.saveProgress();
  }
}