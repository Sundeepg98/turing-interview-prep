# File Reorganization Plan

## Current Issues
- `.cleanup-archive` is a hidden directory meant for temporary/archived files
- Contains many valuable production-ready tools and documentation
- Not easily discoverable or maintainable in current location

## Proposed New Structure

```
/var/projects/interview_prep/
├── index.html                    # Main application (keep as-is)
├── tests/                        # All testing-related files
│   ├── playwright/              # Playwright test specs
│   ├── tools/                   # Testing utilities and debugging scripts
│   └── fixtures/                # Test HTML pages and fixtures
├── scripts/                      # Utility scripts
│   ├── maintenance/             # Archive maintenance scripts
│   └── performance/             # Benchmarking tools
├── docs/                         # All documentation
│   ├── development/             # Development guides
│   ├── testing/                 # Test reports and results
│   └── architecture/            # Project structure docs
└── archive/                      # Keep for test result archives only
```

## Files to Reorganize

### 1. Testing Tools → `tests/tools/`
- `.cleanup-archive/debugging/*.js` (13 files)
- `.cleanup-archive/analysis-files/*.js` (3 files)
- `.cleanup-archive/final-check.js`
- `archive/playwright-tests/check-*.js` utilities

### 2. Documentation → `docs/`
- `.cleanup-archive/fixes/COPY_BUTTON_README.md` → `docs/development/`
- `.cleanup-archive/fixes/search-improvements-summary.md` → `docs/development/`
- `.cleanup-archive/misc/PROJECT_STRUCTURE.md` → `docs/architecture/`
- `.cleanup-archive/misc/FINAL_SUMMARY.md` → `docs/testing/`
- `archive/test-reports/SUCCESS_REPORT.md` → `docs/testing/`

### 3. Test Fixtures → `tests/fixtures/`
- `.cleanup-archive/test-pages/*.html` (12 files)

### 4. Scripts → `scripts/`
- `archive/scripts/maintain-tests.js` → `scripts/maintenance/`
- `archive/scripts/compress-traces.js` → `scripts/maintenance/`
- `.cleanup-archive/benchmarks/claude-with-timeout.sh` → `scripts/performance/`

### 5. Playwright Tests → `tests/playwright/`
- `archive/playwright-tests/*.spec.js` (9 files)

## Benefits
1. **Discoverability**: Files in standard locations, not hidden
2. **Maintainability**: Clear separation of concerns
3. **Git-friendly**: Can track changes to tools and docs
4. **Professional**: Standard project structure
5. **Accessible**: Easy to find and use utilities

## Implementation Steps
1. Create new directory structure
2. Move files to appropriate locations
3. Update paths in any scripts that reference old locations
4. Update .gitignore if needed
5. Remove empty directories from .cleanup-archive
6. Document the new structure in README.md

This reorganization will make all valuable tools and documentation easily accessible while maintaining a clean, professional project structure.