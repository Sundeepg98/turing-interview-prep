# How CPU Cores Actually Matter for Parallel Tests

## What is a CPU Core?

A CPU core is a physical processing unit that can execute one instruction stream at a time. Your system has **12 cores** = 12 parallel instruction streams.

## The Fundamental Truth

**One CPU core can only execute ONE process at any given moment.**

```
Time →
Core 1: [Process A][Process B][Process C][Process A]...
Core 2: [Process D][Process E][Process F][Process D]...
...
Core 12: [Process X][Process Y][Process Z][Process X]...
```

## What Happens With Multiple Processes Per Core

### With 12 Processes on 12 Cores (1:1 ratio)
```
Core 1:  [Browser 1 continuously running....................]
Core 2:  [Browser 2 continuously running....................]
...
Core 12: [Browser 12 continuously running..................]

Result: Smooth, efficient execution
```

### With 75 Processes on 12 Cores (6.25:1 ratio)
```
Time slice = 10ms (typical OS quantum)

Core 1:  [B1-10ms][B13-10ms][B25-10ms][B37-10ms][B49-10ms][B61-10ms][B1-10ms]...
Core 2:  [B2-10ms][B14-10ms][B26-10ms][B38-10ms][B50-10ms][B62-10ms][B2-10ms]...

Each browser gets CPU time only 1/6th of the time!
```

## The Context Switching Penalty

### What is Context Switching?
When CPU switches between processes, it must:
1. Save current process state (registers, program counter)
2. Flush CPU caches
3. Load new process state
4. Rebuild caches

**Cost: 1-10 microseconds per switch**

### The Math With 75 Processes
```
375 total processes (75 browsers × 5 processes each)
Time slice: 10ms
Switches per second per core: 100

Context switch overhead:
- 100 switches × 2μs = 200μs = 0.2ms per second
- 2% overhead seems small...

BUT THE REAL KILLER: Cache Misses!
```

## Cache Destruction - The Hidden Performance Killer

### How CPU Caches Work
```
CPU Core
├── L1 Cache (32KB) - 1 cycle access
├── L2 Cache (256KB) - 10 cycles access  
├── L3 Cache (20MB shared) - 30 cycles access
└── Main Memory (15GB) - 200+ cycles access
```

### With 12 Processes (Good)
```
Browser 1 runs continuously on Core 1:
- Code stays in L1/L2 cache
- Data stays hot in cache
- Memory access: 1-10 cycles

Performance: 100%
```

### With 75 Processes (Disaster)
```
Browser 1 runs for 10ms on Core 1:
- Loads data into cache
- Switches out
- 5 other browsers trash the cache
- Browser 1 returns 60ms later
- Cache is completely cold
- Every memory access: 200+ cycles

Performance: ~20% (5x slower!)
```

## Real World Example

### Test: Loading a Web Page

**With proper core allocation (12 workers):**
```
1. Parse HTML: 50ms (data in cache)
2. Execute JS: 100ms (code in cache)
3. Render: 50ms (GPU coordinates well)
Total: 200ms
```

**With oversubscription (75 workers):**
```
1. Parse HTML: 250ms (cache misses everywhere)
2. Execute JS: 500ms (constant cache reloads)
3. Render: 250ms (GPU queue congestion)
Total: 1000ms (5x slower!)
```

## CPU Pipeline Stalls

Modern CPUs are pipelined - they process multiple instructions in parallel:
```
Clock 1: [Fetch A][Decode B][Execute C][Memory D][Write E]
Clock 2: [Fetch B][Decode C][Execute D][Memory E][Write F]
```

With frequent context switches:
- Pipeline must be flushed
- Branch predictor reset
- Speculative execution wasted
- 20-30 cycles lost per switch

## The Scheduling Overhead

### Linux CFS (Completely Fair Scheduler)
```
With 375 processes:
- Scheduler runs every 1ms
- Must evaluate 375 processes
- O(log n) complexity = ~9 operations per process
- 3,375 operations per ms
- Scheduler itself consumes 5-10% CPU!
```

## Why Web Testing is CPU Intensive

Each browser is doing:
1. **JavaScript execution** - CPU bound
2. **DOM manipulation** - CPU bound
3. **CSS calculations** - CPU bound
4. **Network processing** - CPU bound
5. **Rendering** - CPU/GPU bound

These aren't idle processes waiting for I/O - they're actively computing!

## The Proof in Numbers

### Theoretical vs Actual Performance

```
1 Browser on 1 Core:
- 100% CPU time
- Hot caches
- No context switching
- Performance: 100%

6 Browsers on 1 Core:
- 16.6% CPU time each
- Cold caches
- Constant switching
- Actual performance: ~15% each

75 Browsers on 12 Cores:
- Theoretical: 16% speed (1/6.25)
- Cache penalties: -50%
- Switching overhead: -10%
- Scheduler overhead: -10%
- Actual: ~5-8% speed

Result: 12-20x slower than optimal!
```

## The Bottom Line

**CPU cores matter because:**

1. **Only one process runs per core at a time**
2. **Context switching has real costs** (not just the switch itself, but cache destruction)
3. **Modern CPUs rely on caches** (200x faster than RAM)
4. **Oversubscription destroys cache efficiency**
5. **Scheduler overhead becomes significant**

**With 12 cores:**
- 12 workers = Optimal (100% efficiency)
- 24 workers = OK (70% efficiency)
- 75 workers = Disaster (5-10% efficiency)

It's not just about "sharing" CPU time - it's about the cascading performance penalties of oversubscription!