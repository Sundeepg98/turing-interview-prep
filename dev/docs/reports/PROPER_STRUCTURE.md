# Proposed Clean Structure

## Current Problem
- Too many directories
- Unclear what's product vs development
- Multiple archive locations
- Confusing organization

## Clean Structure (Focused on index.html)

```
/var/projects/interview_prep/
├── index.html              # ⭐ THE PRODUCT
├── README.md               # Simple explanation
├── package.json            # Dependencies
│
├── dev/                    # Everything for development
│   ├── tests/             # All test files
│   ├── scripts/           # All utility scripts
│   └── docs/              # All documentation
│
└── archive/               # ALL archives in one place
    ├── test-results/      # Test run results
    ├── html-versions/     # Historical HTML versions
    └── backups/           # Any backups
```

## Benefits
1. **Clear Product**: index.html is the star
2. **Single Archive**: Everything archived in one place
3. **Dev Separation**: Development tools clearly separated
4. **Simple**: Anyone can understand this structure

## What This Means
- Move `tests/`, `scripts/`, `docs/` → `dev/`
- Move `cleanup-archive-backup-*.tar.gz` → `archive/backups/`
- Move `archive/html-backups/` → `archive/html-versions/`
- Delete redundant reports and logs