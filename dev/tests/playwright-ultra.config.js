// ULTRA PARALLEL PLAYWRIGHT CONFIGURATION
// Optimized for maximum parallel execution

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // ULTRA PARALLEL SETTINGS
  fullyParallel: true,
  
  // Maximum workers - aggressive settings for different scenarios
  workers: process.env.MAX_WORKERS || process.env.CI ? 4 : 20,
  
  // Timeout optimizations
  timeout: 15 * 1000, // 15s per test (reduced from 30s)
  expect: {
    timeout: 3000 // 3s for assertions (reduced from 5s)
  },
  
  // Disable retries for speed
  retries: 0,
  
  // Reporter for parallel execution
  reporter: [
    ['list'],
    ['json', { outputFile: 'ultra-parallel-results.json' }],
    ['html', { outputFolder: 'ultra-parallel-report', open: 'never' }]
  ],
  
  // Shared settings
  use: {
    baseURL: `file://${process.cwd()}/index.html`,
    
    // Disable screenshots/videos for speed
    screenshot: 'off',
    video: 'off',
    trace: 'off',
    
    // Fast navigation
    navigationTimeout: 10000,
    actionTimeout: 5000,
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Disable animations for speed
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled']
    }
  },
  
  // Single browser for maximum speed
  projects: [
    {
      name: 'chromium-fast',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--no-sandbox'
          ]
        }
      },
    }
  ],
  
  // Faster web server
  webServer: {
    command: 'npx http-server . -p 8080 --silent -c-1', // -c-1 disables caching
    port: 8080,
    timeout: 30 * 1000,
    reuseExistingServer: true,
  },
});

// Export different configurations for testing
module.exports.configurations = {
  // Conservative: Good for CI/CD
  conservative: {
    workers: 4,
    timeout: 30000,
    retries: 1
  },
  
  // Balanced: Good for local development
  balanced: {
    workers: 10,
    timeout: 20000,
    retries: 0
  },
  
  // Aggressive: Maximum parallelization
  aggressive: {
    workers: 20,
    timeout: 15000,
    retries: 0
  },
  
  // Extreme: Push the limits
  extreme: {
    workers: 30,
    timeout: 10000,
    retries: 0
  },
  
  // Insane: For benchmarking only
  insane: {
    workers: 50,
    timeout: 5000,
    retries: 0
  }
};