# Debug Tools Guide

## Quick Reference

### Structure Validation
```bash
# Check overall HTML structure
node check-structure.js

# Verify content is rendering correctly
node check-rendered-content.js

# Count and validate code blocks
node count-codeblocks.js
```

## Tool Descriptions

### `check-structure.js`
- Uses JSDOM to parse and validate HTML structure
- Checks for required elements (navigation, content, etc.)
- Validates Bootstrap components
- Useful when: Page layout seems broken

### `check-rendered-content.js`
- Verifies markdown content is properly rendered
- Checks for missing sections or questions
- Validates code block formatting
- Useful when: Content appears missing or malformed

### `count-codeblocks.js`
- Counts total code blocks in the page
- Validates syntax highlighting is applied
- Checks copy button presence
- Useful when: Code examples seem wrong

## Common Debugging Workflows

### 1. Content Not Showing
```bash
node check-rendered-content.js
# Look for "Missing content" errors
```

### 2. Layout Issues
```bash
node check-structure.js
# Check for missing Bootstrap classes
```

### 3. Code Block Problems
```bash
node count-codeblocks.js
# Verify count matches expected (30+)
```

These tools saved hours during development - keep them handy!