#!/bin/bash

echo "=== Optimal Worker Range Test (12-18) ==="
echo "System: $(nproc) CPU cores, $(free -h | grep Mem | awk '{print $2}') RAM"
echo "Testing with quick-parallel-test.spec.js (10 tests)"
echo ""

# Create results file
echo "Workers,Time,Status,Efficiency" > worker-range-results.csv

for workers in 12 13 14 15 16 17 18; do
    echo "Testing with $workers workers..."
    
    # Run test 3 times and average
    total_time=0
    passes=0
    
    for run in 1 2 3; do
        echo -n "  Run $run: "
        start_time=$(date +%s.%N)
        
        # Run test
        npx playwright test quick-parallel-test.spec.js --project=chromium --workers=$workers --reporter=list > /tmp/test-$workers-$run.log 2>&1
        exit_code=$?
        
        end_time=$(date +%s.%N)
        duration=$(echo "$end_time - $start_time" | bc)
        
        if [ $exit_code -eq 0 ]; then
            echo "✓ ${duration}s"
            passes=$((passes + 1))
        else
            echo "✗ ${duration}s"
        fi
        
        total_time=$(echo "$total_time + $duration" | bc)
        sleep 2
    done
    
    # Calculate average
    avg_time=$(echo "scale=2; $total_time / 3" | bc)
    
    # Calculate efficiency (baseline is 10 workers at 22s)
    baseline_total=$(echo "22 * 10" | bc)
    actual_total=$(echo "$avg_time * $workers" | bc)
    efficiency=$(echo "scale=1; ($baseline_total / $actual_total) * 100" | bc)
    
    echo "  Average: ${avg_time}s | Efficiency: ${efficiency}%"
    echo "$workers,$avg_time,$passes/3,${efficiency}%" >> worker-range-results.csv
    echo ""
done

echo "=== Results Summary ==="
cat worker-range-results.csv | column -t -s,
echo ""
echo "=== Analysis ==="
echo "Optimal workers should have:"
echo "- Lowest average time"
echo "- Consistent pass rate (3/3)"
echo "- Efficiency above 50%"