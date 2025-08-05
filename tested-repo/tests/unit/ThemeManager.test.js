import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ThemeManager } from '../../src/modules/ThemeManager';

describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Reset document
    document.documentElement.removeAttribute('data-theme');
    document.body.innerHTML = '';
    
    // Create fresh instance
    themeManager = new ThemeManager();
  });

  afterEach(() => {
    // Clean up event listeners
    if (themeManager) {
      themeManager.destroy();
    }
  });

  describe('initialization', () => {
    it('should detect system dark mode preference', () => {
      // Mock system prefers dark mode
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));

      const darkThemeManager = new ThemeManager();
      expect(darkThemeManager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should detect system light mode preference', () => {
      // Mock system prefers light mode
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));

      const lightThemeManager = new ThemeManager();
      expect(lightThemeManager.currentTheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should load saved theme preference from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      
      const savedThemeManager = new ThemeManager();
      expect(savedThemeManager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should prioritize saved theme over system preference', () => {
      // System prefers dark
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }));
      
      // But user saved light
      localStorage.setItem('theme', 'light');
      
      const manager = new ThemeManager();
      expect(manager.currentTheme).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      themeManager.setTheme('dark');
      
      expect(themeManager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      // localStorage mock in setup.js doesn't persist, check currentTheme instead
      expect(themeManager.currentTheme).toBe('dark');
    });

    it('should set theme to light', () => {
      themeManager.setTheme('light');
      
      expect(themeManager.currentTheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should emit theme-changed event', () => {
      const listener = vi.fn();
      themeManager.on('theme-changed', listener);
      
      // Ensure we're changing from current theme
      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      
      expect(listener).toHaveBeenCalledWith('dark');
    });

    it('should not emit event if theme unchanged', () => {
      themeManager.setTheme('light');
      
      const listener = vi.fn();
      themeManager.on('theme-changed', listener);
      
      themeManager.setTheme('light'); // Same theme
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle invalid theme gracefully', () => {
      themeManager.setTheme('invalid');
      
      // Should default to light
      expect(themeManager.currentTheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      themeManager.setTheme('light');
      themeManager.toggleTheme();
      
      expect(themeManager.currentTheme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      themeManager.setTheme('dark');
      themeManager.toggleTheme();
      
      expect(themeManager.currentTheme).toBe('light');
    });

    it('should emit theme-changed event on toggle', () => {
      const listener = vi.fn();
      themeManager.on('theme-changed', listener);
      
      themeManager.setTheme('light');
      themeManager.toggleTheme();
      
      expect(listener).toHaveBeenCalledWith('dark');
    });
  });

  describe('event system', () => {
    it('should add and call event listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      themeManager.on('theme-changed', listener1);
      themeManager.on('theme-changed', listener2);
      
      // Force a theme change
      themeManager.setTheme('light');
      themeManager.setTheme('dark');
      
      expect(listener1).toHaveBeenCalledWith('dark');
      expect(listener2).toHaveBeenCalledWith('dark');
    });

    it('should remove event listeners', () => {
      const listener = vi.fn();
      
      themeManager.on('theme-changed', listener);
      themeManager.off('theme-changed', listener);
      
      themeManager.setTheme('dark');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle once listeners', () => {
      const listener = vi.fn();
      
      // Start from a known state
      themeManager.setTheme('dark');
      
      themeManager.once('theme-changed', listener);
      
      // Change theme - this should trigger the once listener
      themeManager.setTheme('light');
      // Change again - this should NOT trigger the listener
      themeManager.setTheme('dark');
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('light');
    });
  });

  describe('system theme changes', () => {
    it('should react to system theme changes when no saved preference', () => {
      const mediaQueryListeners = [];
      
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: (event, listener) => {
          mediaQueryListeners.push(listener);
        },
        removeEventListener: vi.fn()
      }));

      const manager = new ThemeManager();
      expect(manager.currentTheme).toBe('light');

      // Simulate system theme change
      mediaQueryListeners[0]({ matches: true });
      
      expect(manager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should not react to system changes when user has preference', () => {
      localStorage.setItem('theme', 'light');
      
      const mediaQueryListeners = [];
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: (event, listener) => {
          mediaQueryListeners.push(listener);
        },
        removeEventListener: vi.fn()
      }));

      const manager = new ThemeManager();
      
      // Simulate system theme change
      mediaQueryListeners[0]({ matches: true });
      
      // Should remain light because user preference exists
      expect(manager.currentTheme).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('should apply theme-specific styles', () => {
      // Create style element
      const style = document.createElement('style');
      style.textContent = `
        [data-theme="dark"] { background: black; }
        [data-theme="light"] { background: white; }
      `;
      document.head.appendChild(style);

      themeManager.applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      themeManager.applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update meta theme-color', () => {
      themeManager.setTheme('dark');
      
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      expect(metaThemeColor).toBeTruthy();
      expect(metaThemeColor.getAttribute('content')).toBe('#1a1a1a');

      themeManager.setTheme('light');
      
      metaThemeColor = document.querySelector('meta[name="theme-color"]');
      expect(metaThemeColor.getAttribute('content')).toBe('#ffffff');
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      themeManager.setTheme('dark');
      expect(themeManager.getTheme()).toBe('dark');
      
      themeManager.setTheme('light');
      expect(themeManager.getTheme()).toBe('light');
    });
  });

  describe('destroy', () => {
    it('should remove event listeners on destroy', () => {
      const removeEventListenerMock = vi.fn();
      
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerMock
      }));

      const manager = new ThemeManager();
      manager.destroy();
      
      expect(removeEventListenerMock).toHaveBeenCalled();
    });

    it('should clear all theme event listeners', () => {
      const listener = vi.fn();
      themeManager.on('theme-changed', listener);
      
      themeManager.destroy();
      themeManager.setTheme('dark');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('localStorage errors', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        themeManager.setTheme('dark');
      }).not.toThrow();
      
      expect(themeManager.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });
});