# Interview Prep - Fundamentally Tested Repository

A modern, fully-tested interview preparation application built with vanilla JavaScript and comprehensive test coverage.

## 🏗️ Architecture

```
tested-repo/
├── src/                    # Source code
│   ├── modules/           # Core business logic
│   │   ├── ContentManager.js
│   │   ├── SearchEngine.js
│   │   └── ThemeManager.js
│   ├── App.js             # Main application
│   └── main.js            # Entry point
├── tests/                 # Comprehensive test suite
│   ├── unit/             # Unit tests for modules
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   ├── mocks/            # Mock service worker
│   └── setup.js          # Test configuration
├── public/               # Static assets
│   └── content/          # Question data
└── coverage/             # Test coverage reports
```

## 🧪 Testing Strategy

### Unit Tests (80%+ coverage)
- **ContentManager**: Question loading, progress tracking, statistics
- **SearchEngine**: Fuzzy search, filtering, highlighting
- **ThemeManager**: Theme switching, persistence, system preferences

### Integration Tests
- Module interactions
- Data flow between components
- Error handling scenarios
- Performance benchmarks

### E2E Tests (Playwright)
- User workflows
- Navigation flows
- Search functionality
- Progress tracking
- Theme switching
- Mobile responsiveness

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing

Run all tests:
```bash
npm test
```

Run specific test types:
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E tests only
npm run test:coverage     # With coverage report
```

Watch mode:
```bash
npm run test:watch
```

View coverage:
```bash
npm run test:coverage:ui
```

### Building
```bash
npm run build             # Runs validation then builds
npm run validate         # Lint, type-check, and test
```

## 📊 Test Coverage

Current coverage targets:
- Lines: 80%+
- Functions: 80%+
- Branches: 80%+
- Statements: 80%+

View detailed coverage report:
```bash
open coverage/index.html
```

## 🔧 Key Features

### 1. **Modular Architecture**
- Clean separation of concerns
- Dependency injection
- Event-driven communication
- No global state pollution

### 2. **Comprehensive Testing**
- Mock Service Worker for API mocking
- Custom test utilities
- Performance benchmarks
- Snapshot testing

### 3. **Progressive Web App**
- Offline support
- Service worker caching
- Responsive design
- Theme persistence

### 4. **Search Capabilities**
- Fuzzy search with Fuse.js
- Real-time highlighting
- Search suggestions
- Advanced filtering

### 5. **Progress Tracking**
- Question completion
- Bookmarking
- Statistics by category/difficulty
- Progress persistence

## 🛠️ Development Tools

- **Vitest**: Fast unit testing
- **Playwright**: Cross-browser E2E testing
- **MSW**: API mocking
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Vite**: Build tooling

## 📝 Writing Tests

### Unit Test Example
```javascript
import { describe, it, expect } from 'vitest';
import { ContentManager } from '../src/modules/ContentManager';

describe('ContentManager', () => {
  it('should load questions', async () => {
    const manager = new ContentManager();
    const questions = await manager.loadQuestions();
    expect(questions).toHaveLength(5);
  });
});
```

### E2E Test Example
```javascript
import { test, expect } from '@playwright/test';

test('should search for questions', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="search"]', 'typescript');
  await page.press('input[type="search"]', 'Enter');
  
  const results = page.locator('.search-result-item');
  await expect(results).toHaveCount(1);
});
```

## 🚢 CI/CD Pipeline

The project includes GitHub Actions workflow for:
- Running all tests on PR
- Coverage reporting
- Build verification
- Cross-browser testing
- Deployment to GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details