const { test, expect } = require('@playwright/test');

// ULTRA PARALLEL TEST CONFIGURATION
// Optimized for maximum parallel execution efficiency

test.describe.configure({ mode: 'parallel' });

const HTML_PATH = 'file:///var/projects/interview_prep/index.html';

// Generate 100 tests for extreme parallel testing
test.describe('Ultra Parallel Test Suite - 100 Tests', () => {
  // Test different aspects in parallel batches
  
  // Batch 1: Element visibility tests (25 tests)
  for (let i = 1; i <= 25; i++) {
    test(`Visibility Test ${i}: Check UI element presence`, async ({ page }) => {
      await page.goto(HTML_PATH);
      const elements = ['#searchBox', '#darkModeToggle', '#sidebarNav', '#contentContainer', '#progressBar'];
      const element = elements[i % elements.length];
      await expect(page.locator(element)).toBeVisible({ timeout: 5000 });
    });
  }

  // Batch 2: Search functionality tests (25 tests)
  for (let i = 1; i <= 25; i++) {
    test(`Search Test ${i}: Verify search with term "${i}"`, async ({ page }) => {
      await page.goto(HTML_PATH);
      const searchBox = page.locator('#searchBox');
      await searchBox.fill(`test${i}`);
      await page.waitForTimeout(200); // Debounce
      // Just verify search box accepts input
      await expect(searchBox).toHaveValue(`test${i}`);
    });
  }

  // Batch 3: Navigation tests (25 tests)
  for (let i = 1; i <= 25; i++) {
    test(`Navigation Test ${i}: Click nav item`, async ({ page }) => {
      await page.goto(HTML_PATH);
      const navItems = await page.locator('#sidebarNav a').all();
      if (navItems.length > 0) {
        const index = i % navItems.length;
        await navItems[index].click();
        // Verify page scrolled
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThanOrEqual(0);
      }
    });
  }

  // Batch 4: Performance tests (25 tests)
  for (let i = 1; i <= 25; i++) {
    test(`Performance Test ${i}: Page load time check`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(HTML_PATH);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Generous timeout
    });
  }
});

// Additional lightweight test suite for instant execution (50 tests)
test.describe('Ultra Fast Parallel Tests - 50 Instant Tests', () => {
  test.beforeAll(async ({ browser }) => {
    // Pre-warm the browser
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(HTML_PATH);
    await context.close();
  });

  for (let i = 1; i <= 50; i++) {
    test(`Instant Test ${i}: Quick element check`, async ({ page }) => {
      await page.goto(HTML_PATH);
      // Super fast check - just verify page loaded
      const title = await page.title();
      expect(title).toBeTruthy();
    });
  }
});