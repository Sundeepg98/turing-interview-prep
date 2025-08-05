import { ContentManager } from './modules/ContentManager.js';
import { SearchEngine } from './modules/SearchEngine.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { App } from './App.js';

// Initialize the application
async function init() {
  try {
    // Show loading state
    const root = document.getElementById('app');
    root.innerHTML = '<div class="loading">Loading...</div>';

    // Initialize modules
    const contentManager = new ContentManager();
    const themeManager = new ThemeManager();
    
    // Load content
    const questions = await contentManager.loadQuestions();
    
    if (questions.length === 0) {
      throw new Error('No questions loaded');
    }

    // Initialize search engine with loaded questions
    const searchEngine = new SearchEngine(questions);

    // Create and mount app
    const app = new App({
      contentManager,
      searchEngine,
      themeManager
    });

    await app.mount('#app');

    // Remove loading state
    root.classList.remove('loading');

  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.getElementById('app').innerHTML = `
      <div class="error">
        <h2>Failed to load application</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Register service worker for offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}