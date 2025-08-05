#!/bin/bash

echo "=== Playwright Worker Benchmark ==="
echo "System: $(nproc) CPU cores, $(free -h | grep Mem | awk '{print $2}') RAM"
echo ""

for workers in 1 5 10 20 30 40 50; do
    echo "Testing with $workers workers..."
    start_time=$(date +%s)
    
    # Run tests and capture result
    if npx playwright test quick-parallel-test.spec.js --project=chromium --workers=$workers --reporter=json 2>&1 | grep '"unexpected": 0' > /dev/null; then
        status="✓ PASS"
    else
        status="✗ FAIL"
    fi
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo "  Workers: $workers | Time: ${duration}s | Status: $status"
    echo ""
    
    # Small delay between runs
    sleep 2
done

echo "=== Analysis ==="
echo "- Playwright caps workers at test count (10 tests = max 10 workers)"
echo "- System has 12 CPU cores"
echo "- Optimal workers: 2-3x CPU cores for I/O bound tests"