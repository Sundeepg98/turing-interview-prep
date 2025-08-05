# Worker Range 12-18 Analysis Results

## Key Finding: Playwright Auto-Caps at Test Count!

When we tested 12-18 workers with our test suites:

### Quick Test Suite (10 tests)
| Workers Requested | Workers Used | Time | Result |
|-------------------|--------------|------|--------|
| 12 | 10 | 16.0s | ✓ All pass |
| 14 | 10 | 18.5s | ✓ All pass |
| 16 | 10 | 18.1s | ✓ All pass |
| 18 | 10 | 16.3s | ✓ All pass |

**All capped at 10 workers** (test count)

### Final Test Suite (12 tests)
| Workers Requested | Workers Used | Time | Pass Rate |
|-------------------|--------------|------|-----------|
| 12 | 12 | 19.7s | 10/12 |
| 15 | 12 | 27.2s | 10/12 |
| 18 | 12 | 29.7s | 10/12 |

**All capped at 12 workers** (test count)

## Why No Difference 12-18?

**Playwright's Smart Capping**:
```javascript
actualWorkers = Math.min(requestedWorkers, testCount)
// Math.min(18, 12) = 12
```

You can request 12, 15, or 18 workers, but with 12 tests, Playwright uses exactly 12 workers every time!

## The Real Comparison

To properly test 12-18 workers, we'd need:
- A test suite with 20+ tests
- Or force some tests to run sequentially

### With 75-Test Suite (parallel-test-suite.spec.js)

This is where 12-18 workers would actually differ:

| Workers | Tests per Worker | Batches | Theoretical Time |
|---------|------------------|---------|------------------|
| 12 | 6.25 | 7 rounds | Baseline |
| 15 | 5.0 | 5 rounds | ~30% faster |
| 18 | 4.17 | 5 rounds | ~30% faster |

## System Resource Usage

Looking at the `time` command output:

### 12 Workers
- Real: 21.1s
- User CPU: 93.9s (4.4x multiplier)
- System: 17.9s

### 18 Workers (still 12 used)
- Real: 31.2s (slower! why?)
- User CPU: 144.3s (4.6x multiplier)
- System: 26.1s

The slower times with "more" workers requested might be due to:
1. Playwright's internal overhead checking limits
2. Random system load variations
3. The 2 failing tests affecting timing

## Conclusion

**For 12-18 worker comparison:**
1. With ≤12 tests: No difference (all capped at test count)
2. With 13-18 tests: Each test gets its own worker
3. With 19+ tests: This is where 12 vs 18 workers matters

**The sweet spot remains:**
- For 10 tests: 10 workers
- For 12 tests: 12 workers  
- For 20 tests: 15-18 workers
- For 75 tests: 15-18 workers

**Key insight**: Playwright prevents you from over-allocating workers beyond test count, protecting you from yourself!