# Development Tools Inventory

## Reusable Tools from .cleanup-archive

### 1. **Debugging Tools** (High Reuse Value)
These scripts can be reused for future debugging:

#### Structure & Content Validation
- `check-structure.js` - Validates HTML structure with JSDOM
- `check-rendered-content.js` - Verifies content rendering
- `count-codeblocks.js` - Counts and validates code blocks
- `debug-missing-blocks.js` - Debugs missing content blocks

#### Browser Testing
- `test-browser.js` - Basic browser testing
- `test-browser-detailed.js` - Comprehensive browser tests
- `test-jsdom.js` - JSDOM environment testing
- `test-page.js` - Full page validation

#### Specific Feature Testing
- `test-animations.js` - Animation functionality
- `test-markdown-parser.js` - Markdown parsing tests
- `test-quiz-scores.js` - Quiz scoring validation

### 2. **Fix Scripts** (Templates for Future Fixes)
These provide patterns for common fixes:

#### Markdown & Content Fixes
- `fix-markdown-complete.js` - Complete markdown parsing solution
- `fix-markdown-parsing.js` - Targeted parsing fixes
- `add-render-section.js` - Section rendering patterns
- `fix-missing-sections.js` - Content restoration

#### Feature Implementation
- `copy-button-fix.js` - Copy button implementation
- `run-copy-button-tests.js` - Puppeteer test runner
- `test-copy-buttons.js` - Copy functionality tests
- `patch-html.js` - HTML patching patterns

### 3. **Test Pages** (UI Component Testing)
Reusable HTML test harnesses:

#### Core Functionality
- `test-functionality.html` - General functionality testing template
- `test-markdown-rendering.html` - Markdown rendering tests
- `test-with-bootstrap.html` - Bootstrap integration testing

#### Specific Components
- `test-typing-animation.html` - Typing effect testing
- `test-tooltips.html` - Tooltip functionality
- `test_fab.html` - Floating Action Button tests
- `test_quiz.html` & `test_quiz_fixed.html` - Quiz component testing

### 4. **Analysis Tools** (Performance & Quality)
- `markdown-parser-analysis.json` - Parser performance data
- `question-quotes-analysis.json` - Content quality checks

### 5. **Verification Scripts**
- `final-check.js` - Comprehensive validation suite

## Why Keep These?

1. **Time Savings**: Avoid rewriting complex debugging logic
2. **Proven Solutions**: These scripts already solved problems
3. **Test Infrastructure**: Ready-made test harnesses
4. **Reference Implementation**: Working examples of fixes
5. **Diagnostic Tools**: Quick problem identification

## Usage Scenarios

### When Debugging Issues
```bash
# Check content structure
node tests/tools/check-structure.js

# Debug missing content
node tests/tools/debug-missing-blocks.js

# Test in JSDOM environment
node tests/tools/test-jsdom.js
```

### When Implementing Features
```bash
# Reference copy button implementation
cat scripts/fixes/copy-button-fix.js

# Run Puppeteer tests
node scripts/fixes/run-copy-button-tests.js
```

### When Testing UI Components
```bash
# Open test harness
open tests/fixtures/test-functionality.html

# Test specific component
open tests/fixtures/test_quiz.html
```

## Recommendation

Instead of deleting, organize into:
1. `tests/tools/debug/` - Debugging utilities
2. `scripts/fixes/templates/` - Fix script templates
3. `tests/fixtures/components/` - Component test pages
4. Create a backup archive of the entire .cleanup-archive