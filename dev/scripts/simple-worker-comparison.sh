#!/bin/bash

echo "=== Worker Range Comparison (12-18) ==="
echo ""

for workers in 12 14 16 18; do
    echo "Testing $workers workers..."
    
    # Time the execution
    start=$(date +%s)
    
    npx playwright test quick-parallel-test.spec.js --project=chromium --workers=$workers --reporter=list 2>&1 | tail -5 | grep -E "(passed|failed)" &
    
    # Get the PID and wait
    test_pid=$!
    wait $test_pid
    
    end=$(date +%s)
    duration=$((end - start))
    
    echo "  Time: ${duration}s"
    echo ""
    
    sleep 3
done