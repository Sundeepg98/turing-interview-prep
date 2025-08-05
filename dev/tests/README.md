# Testing Directory

## Overview
Comprehensive testing infrastructure for the Interview Preparation Guide.

## Structure

### `/playwright`
Playwright test specifications (9 test files):
- `extreme-test.spec.js` - Validates all 18 questions and 30+ code blocks
- `test-search.spec.js` - Search functionality with edge cases
- `test-copy-buttons.spec.js` - Copy button functionality
- `test-functionality.spec.js` - General UI features
- `test-responsive.spec.js` - Responsive design
- `test-console-errors.spec.js` - JavaScript error detection
- `test-sidebar-toggle.spec.js` - Navigation testing
- `test-100-percent.spec.js` - Complete coverage verification
- `test-all-fixes.spec.js` - Fix verification

### `/tools`
Testing utilities and debugging scripts (20+ files):
- `final-check.js` - Comprehensive verification of all features
- `check-structure.js` - HTML structure validation
- `test-page.js` - Page testing utilities
- `count-codeblocks.js` - Code block validation
- `fab_analysis.js` - Floating Action Button analysis
- Various debugging and validation scripts

### `/fixtures`
Test HTML pages (12 files):
- `test-functionality.html` - Feature testing page
- `test-markdown-rendering.html` - Markdown tests
- `test-typing-animation.html` - Animation tests
- `test-tooltips.html` - Tooltip functionality
- Other feature-specific test pages

## Running Tests

```bash
# Run all Playwright tests
npx playwright test

# Run specific test
npx playwright test tests/playwright/extreme-test.spec.js

# Run verification script
node tests/tools/final-check.js
```

## Test Results
- 100% feature coverage achieved
- All 18 questions validated
- All 30+ code blocks verified
- All interactive features working