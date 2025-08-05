import { vi } from 'vitest';

// Mock localStorage helper
export const createLocalStorageMock = () => {
  const store = {};
  
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
};

// Mock fetch helper
export const createFetchMock = (responses = {}) => {
  return vi.fn((url) => {
    const response = responses[url] || { ok: false, status: 404 };
    
    return Promise.resolve({
      ok: response.ok !== false,
      status: response.status || 200,
      json: () => Promise.resolve(response.data || {}),
      text: () => Promise.resolve(response.text || ''),
      headers: new Headers(response.headers || {})
    });
  });
};

// Wait for condition helper
export const waitFor = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
};

// Create mock questions data
export const createMockQuestions = (count = 10) => {
  const categories = ['JavaScript', 'TypeScript', 'React', 'DevOps', 'Testing'];
  const difficulties = ['easy', 'medium', 'hard'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    title: `Test Question ${i + 1}`,
    content: `This is the content for test question ${i + 1}. It contains important information about ${categories[i % categories.length]}.`,
    category: categories[i % categories.length],
    difficulty: difficulties[i % difficulties.length],
    tags: [`tag${i + 1}`, categories[i % categories.length].toLowerCase()]
  }));
};

// Performance measurement helper
export const measurePerformance = async (fn, name = 'Operation') => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  
  return {
    result,
    duration: end - start
  };
};

// Event emitter mock
export class MockEventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
  }
  
  off(event, listener) {
    if (this.events.has(event)) {
      this.events.get(event).delete(listener);
    }
  }
  
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(listener => listener(...args));
    }
  }
  
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// DOM helpers
export const createMockElement = (tag = 'div', attributes = {}) => {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'textContent' || key === 'innerHTML') {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  return element;
};

// Async test helpers
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Snapshot helpers
export const sanitizeSnapshot = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Remove timestamps
    if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt') {
      return '[TIMESTAMP]';
    }
    // Remove random IDs
    if (key === 'id' && typeof value === 'string' && value.length > 20) {
      return '[GENERATED_ID]';
    }
    return value;
  }));
};