const { test, expect } = require('@playwright/test');

// Create 30 tests to properly test different worker counts
test.describe.configure({ mode: 'parallel' });

const HTML_PATH = 'file:///var/projects/interview_prep/index.html';

test.describe('Many Tests for Worker Comparison', () => {
  // Generate 30 similar but independent tests
  for (let i = 1; i <= 30; i++) {
    test(`Test ${i}: Load page and verify element`, async ({ page }) => {
      await page.goto(HTML_PATH);
      
      // Simulate some work
      await page.waitForTimeout(1000);
      
      // Verify a random element
      const elements = ['#searchBox', '#darkModeToggle', '#sidebarNav', '#contentContainer', '#progressBar'];
      const element = elements[i % elements.length];
      
      await expect(page.locator(element)).toBeVisible();
      
      // Add some CPU work
      await page.evaluate(() => {
        let sum = 0;
        for (let j = 0; j < 1000000; j++) {
          sum += Math.sqrt(j);
        }
        return sum;
      });
    });
  }
});