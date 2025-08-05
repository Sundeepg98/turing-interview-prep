# Refactoring Plan: From Monolith to Modular

## Step 1: Extract Embedded Content

### Current State:
```javascript
// Lines 500-2400 in index.html
const markdownContent = `# Complete Turing Interview Preparation Guide
... 2000 lines of markdown ...`;
```

### Target State:
```javascript
// src/content/questions/01-iac.json
{
  "id": "infrastructure-as-code",
  "title": "How does Pulumi differ from Terraform?",
  "content": "...",
  "codeExamples": [...]
}
```

### Extraction Script:
```javascript
// scripts/extract-content.js
const fs = require('fs');
const htmlContent = fs.readFileSync('index.html', 'utf8');
const contentMatch = htmlContent.match(/const markdownContent = `([\s\S]*?)`;/);
const questions = parseMarkdownToQuestions(contentMatch[1]);
questions.forEach((q, i) => {
  fs.writeFileSync(
    `src/content/questions/${i.toString().padStart(2, '0')}-${q.slug}.json`,
    JSON.stringify(q, null, 2)
  );
});
```

## Step 2: Create Module Structure

### Core Modules:
```javascript
// src/modules/ContentManager.js
export class ContentManager {
  async loadQuestions() {
    const response = await fetch('./content/questions.json');
    return response.json();
  }
}

// src/modules/SearchEngine.js
export class SearchEngine {
  constructor(content) {
    this.index = this.buildIndex(content);
  }
  
  search(query) {
    // Implement fuzzy search
  }
}

// src/modules/ThemeManager.js
export class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
  }
  
  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.apply();
  }
}

// src/modules/CodeBlockManager.js
export class CodeBlockManager {
  constructor() {
    this.clipboard = new ClipboardJS('.copy-btn');
  }
  
  highlightAll() {
    Prism.highlightAll();
  }
}
```

## Step 3: Component-Based UI

### Without Framework:
```javascript
// src/components/QuestionCard.js
export function QuestionCard(question) {
  return `
    <div class="question-card" data-id="${question.id}">
      <h2>${question.title}</h2>
      <div class="content">${question.htmlContent}</div>
      ${question.codeExamples.map(CodeBlock).join('')}
    </div>
  `;
}

// src/components/CodeBlock.js
export function CodeBlock(code, index) {
  return `
    <div class="code-block">
      <button class="copy-btn" data-clipboard-target="#code-${index}">
        Copy
      </button>
      <pre><code id="code-${index}" class="language-${code.language}">
${escapeHtml(code.content)}
      </code></pre>
    </div>
  `;
}
```

## Step 4: Build Configuration

### Vite Configuration:
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
```

## Step 5: Progressive Migration

### Phase 1: Extract Without Breaking
1. Copy index.html to index-legacy.html
2. Extract content to JSON files
3. Create build process that generates same HTML

### Phase 2: Modularize JavaScript
1. Extract each feature to a module
2. Use ES6 imports
3. Bundle with Rollup/Vite

### Phase 3: Improve Architecture
1. Add proper state management
2. Implement virtual DOM or reactive updates
3. Add proper routing for questions

### Phase 4: Add Tests
```javascript
// tests/SearchEngine.test.js
describe('SearchEngine', () => {
  test('finds questions by keyword', () => {
    const engine = new SearchEngine(mockQuestions);
    const results = engine.search('pulumi');
    expect(results).toHaveLength(5);
  });
});
```

## Benefits of Refactoring

1. **Maintainability**: Edit individual question files
2. **Scalability**: Easy to add new features
3. **Performance**: Lazy load content
4. **Testing**: Unit test each module
5. **Collaboration**: Multiple devs can work on different parts

## Migration Strategy

1. **Keep Both Versions**: During migration
2. **Feature Parity First**: Match current functionality
3. **Incremental Updates**: One module at a time
4. **Continuous Testing**: Ensure nothing breaks

## Time Estimate

- Extract content: 2 hours
- Create modules: 4 hours
- Build system: 2 hours
- Testing: 4 hours
- **Total: ~12 hours for basic refactor**

This would transform the project from an unmaintainable monolith to a proper, scalable application.