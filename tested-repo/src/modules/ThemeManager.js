export class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.listeners = new Map();
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.init();
  }

  init() {
    // Check for saved theme preference
    const savedTheme = this.getSavedTheme();
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Use system preference
      this.currentTheme = this.mediaQuery.matches ? 'dark' : 'light';
    }

    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    this.mediaQueryListener = (e) => {
      if (!this.getSavedTheme()) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  getSavedTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      console.error('Failed to get saved theme:', error);
      return null;
    }
  }

  setTheme(theme) {
    // Validate theme
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }

    if (this.currentTheme === theme) {
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    
    // Save preference
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }

    // Emit event
    this.emit('theme-changed', theme);
  }

  applyTheme(theme) {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getTheme() {
    return this.currentTheme;
  }

  // Event system
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
  }

  off(event, listener) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(listener);
    }
  }

  once(event, listener) {
    const onceWrapper = (data) => {
      listener(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(listener => {
        listener(data);
      });
    }
  }

  destroy() {
    // Remove system theme change listener
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
    
    // Clear all listeners
    this.listeners.clear();
  }

  // Additional theme utilities
  getSystemTheme() {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  hasUserPreference() {
    return this.getSavedTheme() !== null;
  }

  clearUserPreference() {
    try {
      localStorage.removeItem('theme');
      // Revert to system preference
      this.setTheme(this.getSystemTheme());
    } catch (error) {
      console.error('Failed to clear theme preference:', error);
    }
  }

  // CSS custom properties for themes
  getThemeColors() {
    const themes = {
      light: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6'
      },
      dark: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        background: '#1a1a1a',
        surface: '#2b2b2b',
        text: '#ffffff',
        textSecondary: '#adb5bd',
        border: '#495057'
      }
    };

    return themes[this.currentTheme];
  }
}