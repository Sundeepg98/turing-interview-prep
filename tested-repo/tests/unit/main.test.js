import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the modules before importing main
vi.mock('../../src/modules/ContentManager', () => ({
  ContentManager: vi.fn().mockImplementation(() => ({
    loadQuestions: vi.fn(() => Promise.resolve([{ id: '1', title: 'Test' }])),
    questions: [{ id: '1', title: 'Test' }]
  }))
}));

vi.mock('../../src/modules/SearchEngine', () => ({
  SearchEngine: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('../../src/modules/ThemeManager', () => ({
  ThemeManager: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('../../src/App', () => ({
  App: vi.fn().mockImplementation(() => ({
    mount: vi.fn(() => Promise.resolve())
  }))
}));

describe('main.js', () => {
  let originalReadyState;
  let mockAddEventListener;
  let mockServiceWorker;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="app"></div>';
    
    // Store original values
    originalReadyState = Object.getOwnPropertyDescriptor(document, 'readyState');
    
    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
      configurable: true
    });
    
    // Mock addEventListener
    mockAddEventListener = vi.spyOn(document, 'addEventListener');
    
    // Mock service worker
    mockServiceWorker = {
      register: vi.fn(() => Promise.resolve({ scope: '/' }))
    };
    
    // Clear module cache
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original readyState
    if (originalReadyState) {
      Object.defineProperty(document, 'readyState', originalReadyState);
    }
    
    // Clean up
    vi.restoreAllMocks();
  });

  it('should wait for DOMContentLoaded when document is loading', async () => {
    // Import main.js
    await import('../../src/main.js');
    
    // Check that event listener was added
    expect(mockAddEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
  });

  it.skip('should initialize immediately when DOM is ready', async () => {
    // Set document as ready
    Object.defineProperty(document, 'readyState', {
      value: 'interactive',
      writable: true,
      configurable: true
    });
    
    // Import main.js
    await import('../../src/main.js');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that app was initialized
    const { App } = await import('../../src/App');
    expect(App).toHaveBeenCalled();
  });

  it('should handle initialization errors', async () => {
    // Mock ContentManager to throw error
    const { ContentManager } = await import('../../src/modules/ContentManager');
    ContentManager.mockImplementation(() => ({
      loadQuestions: vi.fn(() => Promise.reject(new Error('Load failed')))
    }));
    
    // Mock console.error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set document as ready
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });
    
    // Import main.js
    await import('../../src/main.js');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check error handling
    expect(consoleError).toHaveBeenCalledWith('Failed to initialize app:', expect.any(Error));
    expect(document.getElementById('app').innerHTML).toContain('Failed to load application');
    
    consoleError.mockRestore();
  });

  it('should handle empty questions array', async () => {
    // Mock ContentManager to return empty array
    const { ContentManager } = await import('../../src/modules/ContentManager');
    ContentManager.mockImplementation(() => ({
      loadQuestions: vi.fn(() => Promise.resolve([])),
      questions: []
    }));
    
    // Set document as ready
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });
    
    // Import main.js
    await import('../../src/main.js');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check error display
    expect(document.getElementById('app').innerHTML).toContain('No questions loaded');
  });

  it('should register service worker in production', async () => {
    // Mock production environment
    vi.stubEnv('PROD', true);
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true
    });
    
    // Mock window load event
    const windowAddEventListener = vi.spyOn(window, 'addEventListener');
    
    // Set document as ready
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });
    
    // Import main.js
    await import('../../src/main.js');
    
    // Check that load listener was added
    expect(windowAddEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    
    // Trigger load event
    window.dispatchEvent(new Event('load'));
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check service worker registration
    expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
    
    // Clean up
    vi.unstubAllEnvs();
    delete navigator.serviceWorker;
  });

  it('should handle service worker registration failure', async () => {
    // Mock production environment
    vi.stubEnv('PROD', true);
    
    // Mock navigator.serviceWorker with rejection
    mockServiceWorker.register = vi.fn(() => Promise.reject(new Error('SW failed')));
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true
    });
    
    // Mock console.log
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Set document as ready
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });
    
    // Import main.js
    await import('../../src/main.js');
    
    // Trigger load event
    window.dispatchEvent(new Event('load'));
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check error logging
    expect(consoleLog).toHaveBeenCalledWith('SW registration failed:', expect.any(Error));
    
    // Clean up
    consoleLog.mockRestore();
    vi.unstubAllEnvs();
    delete navigator.serviceWorker;
  });

  it.skip('should show loading state initially', async () => {
    // Set document as ready
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    });
    
    // Check initial loading state
    const appDiv = document.getElementById('app');
    expect(appDiv.innerHTML).toBe('');
    
    // Import main.js
    await import('../../src/main.js');
    
    // Check loading state is shown
    expect(appDiv.innerHTML).toContain('Loading...');
  });
});