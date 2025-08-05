#!/bin/bash

echo "=== ULTRA PARALLEL BENCHMARK ==="
echo "System: $(nproc) CPU cores, $(free -h | grep Mem | awk '{print $2}') RAM"
echo "Testing with 150 total tests (100 regular + 50 instant)"
echo ""

# Test different worker configurations
configs=(
    "10:Optimal"
    "15:Aggressive"
    "20:Extreme"
    "25:Ultra"
    "30:Insane"
)

echo "Configuration,Workers,Time(s),Tests/Second,Status" > ultra-benchmark-results.csv

for config in "${configs[@]}"; do
    IFS=':' read -r workers name <<< "$config"
    
    echo "=== Testing $name configuration ($workers workers) ==="
    
    # Clear any previous test artifacts
    rm -rf test-results/ ultra-parallel-report/ 2>/dev/null
    
    # Run the benchmark
    start_time=$(date +%s.%N 2>/dev/null || date +%s)
    
    # Use timeout to prevent hanging
    timeout 60 npx playwright test ultra-parallel-test.spec.js \
        --config=playwright-ultra.config.js \
        --workers=$workers \
        --reporter=json > /tmp/ultra-test-$workers.json 2>&1
    
    exit_code=$?
    end_time=$(date +%s.%N 2>/dev/null || date +%s)
    
    # Calculate duration
    if command -v bc &> /dev/null; then
        duration=$(echo "$end_time - $start_time" | bc)
    else
        duration=$((end_time - start_time))
    fi
    
    # Parse results
    if [ $exit_code -eq 0 ] || [ $exit_code -eq 124 ]; then
        if [ -f /tmp/ultra-test-$workers.json ]; then
            # Try to extract test count
            total_tests=$(grep -o '"expected":[0-9]*' /tmp/ultra-test-$workers.json | head -1 | cut -d: -f2)
            if [ -z "$total_tests" ]; then
                total_tests="150"
            fi
        else
            total_tests="150"
        fi
        
        # Calculate tests per second
        if command -v bc &> /dev/null; then
            tests_per_sec=$(echo "scale=2; $total_tests / $duration" | bc)
        else
            tests_per_sec=$((total_tests / duration))
        fi
        
        status="PASS"
        if [ $exit_code -eq 124 ]; then
            status="TIMEOUT"
        fi
    else
        tests_per_sec="0"
        status="FAIL"
    fi
    
    echo "  Duration: ${duration}s"
    echo "  Tests/second: $tests_per_sec"
    echo "  Status: $status"
    echo ""
    
    # Save to CSV
    echo "$name,$workers,$duration,$tests_per_sec,$status" >> ultra-benchmark-results.csv
    
    # Brief pause between runs
    sleep 3
done

echo "=== RESULTS SUMMARY ==="
cat ultra-benchmark-results.csv | column -t -s,
echo ""

# Find optimal configuration
echo "=== ANALYSIS ==="
echo "Optimal configuration based on tests/second:"
sort -t, -k4 -nr ultra-benchmark-results.csv | head -2 | tail -1 | cut -d, -f1,2

# Show resource usage
echo ""
echo "=== RESOURCE USAGE ==="
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory Free: $(free -h | grep Mem | awk '{print $4}')"

# Generate visual graph (if gnuplot available)
if command -v gnuplot &> /dev/null; then
    echo "
    set terminal dumb
    set title 'Ultra Parallel Performance'
    set xlabel 'Workers'
    set ylabel 'Tests/Second'
    set datafile separator ','
    plot 'ultra-benchmark-results.csv' using 2:4 with lines title 'Performance'
    " | gnuplot 2>/dev/null || echo "Gnuplot visualization skipped"
fi