# Interview Prep Project

## Overview
Static HTML interview guide for Turing DevOps position (Pulumi + TypeScript).

## Structure
```
dist/
  index.html              # Main application (self-contained)
src/
  markdown/
    COMPLETE_TURING_INTERVIEW_GUIDE.md  # Source content
dev/
  tests/                 # Test specifications
  test-output/           # Test results and reports
  scripts/               # Utility scripts
```

## Test Commands
```bash
npm test              # Run all Playwright tests
npm run test:headed   # Run tests with browser visible
npm run test:report   # View HTML test report
npm run test:cleanup  # Clean up old test results
```

## Playwright Configuration
- Workers: 10 (parallel test execution)
- Trace: Only on failure
- Screenshots: Only on failure
- Retries: 0 (for speed)

## Current Task
Update Playwright tests to match the latest HTML structure in dist/index.html.