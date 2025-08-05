const { test, expect } = require('@playwright/test');

// Configure for optimal parallel execution
test.describe.configure({ mode: 'parallel' });

const HTML_PATH = 'file:///var/projects/interview_prep/index.html';

// Fix 1: Only run on installed browsers (Chromium)
test.describe('Fixed Parallel Tests', () => {
  // Fix 2: Proper viewport setup for each test type
  test.use({ 
    viewport: { width: 1280, height: 720 },
    // Fix 3: Increase action timeout for slower operations
    actionTimeout: 10000,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(HTML_PATH);
    // Fix 4: Wait for content to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // Allow JS initialization
  });

  test('Core functionality - Search', async ({ page }) => {
    const searchBox = page.locator('#searchBox');
    await expect(searchBox).toBeVisible({ timeout: 5000 });
    
    await searchBox.fill('Pulumi');
    // Fix 5: Wait for debounce
    await page.waitForTimeout(500);
    
    const highlights = await page.locator('mark.search-highlight').count();
    expect(highlights).toBeGreaterThan(0);
  });

  test('Core functionality - Dark mode', async ({ page }) => {
    const toggle = page.locator('#darkModeToggle');
    await expect(toggle).toBeVisible();
    
    const body = page.locator('body');
    const initialTheme = await body.getAttribute('data-theme') || 'light';
    
    await toggle.click();
    await page.waitForTimeout(300); // Animation time
    
    const newTheme = await body.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('Navigation - Sidebar links', async ({ page }) => {
    const sidebar = page.locator('#sidebarNav');
    await expect(sidebar).toBeVisible();
    
    const firstLink = sidebar.locator('a').first();
    const linkText = await firstLink.textContent();
    
    // Fix 6: Ensure element is in viewport before clicking
    await firstLink.scrollIntoViewIfNeeded();
    await firstLink.click();
    
    // Fix 7: Better scroll detection
    await page.waitForFunction(() => window.scrollY > 0, { timeout: 5000 });
    const scrolled = await page.evaluate(() => window.scrollY);
    expect(scrolled).toBeGreaterThan(0);
  });

  test('Progress bar updates correctly', async ({ page }) => {
    const progressBar = page.locator('#progressBar');
    
    // Get initial width
    const initialStyle = await progressBar.getAttribute('style');
    const initialWidth = parseInt(initialStyle.match(/width:\s*(\d+)%/)?.[1] || '0');
    
    // Fix 8: Scroll to middle of page with smooth behavior
    await page.evaluate(() => {
      const middle = document.body.scrollHeight / 2;
      window.scrollTo({ top: middle, behavior: 'instant' });
    });
    
    // Fix 9: Wait for progress bar animation
    await page.waitForTimeout(500);
    
    const newStyle = await progressBar.getAttribute('style');
    const newWidth = parseInt(newStyle.match(/width:\s*(\d+)%/)?.[1] || '0');
    
    expect(newWidth).toBeGreaterThan(initialWidth);
  });

  test('Content - All questions present', async ({ page }) => {
    // Fix 10: Wait for dynamic content loading
    await page.waitForSelector('.question-card', { timeout: 10000 });
    
    const questions = await page.locator('.question-card').count();
    expect(questions).toBeGreaterThanOrEqual(18);
  });

  test('Code blocks with copy buttons', async ({ page }) => {
    const codeBlocks = page.locator('pre code');
    await expect(codeBlocks.first()).toBeVisible({ timeout: 5000 });
    
    const codeCount = await codeBlocks.count();
    expect(codeCount).toBeGreaterThan(0);
    
    // Fix 11: Hover to reveal copy button
    const firstBlock = page.locator('pre').first();
    await firstBlock.hover();
    
    const copyButton = firstBlock.locator('.copy-code');
    await expect(copyButton).toBeVisible({ timeout: 2000 });
  });

  test('STAR stories formatted correctly', async ({ page }) => {
    const keywords = ['Situation:', 'Task:', 'Action:', 'Result:'];
    
    for (const keyword of keywords) {
      const element = page.locator(`text=${keyword}`).first();
      await expect(element).toBeVisible({ timeout: 5000 });
    }
  });

  test('No console errors on load', async ({ page }) => {
    const errors = [];
    
    // Fix 12: Set up console listener before navigation
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload to catch all errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });
});

// Separate describe block for mobile tests with proper setup
test.describe('Mobile Tests', () => {
  // Fix 13: Mobile-specific configuration
  test.use({ 
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  });

  test('Mobile menu toggle works', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('domcontentloaded');
    
    // Fix 14: Wait for mobile layout to apply
    await page.waitForTimeout(1000);
    
    const hamburger = page.locator('.navbar-toggler');
    await expect(hamburger).toBeVisible({ timeout: 5000 });
    
    await hamburger.click();
    
    const navCollapse = page.locator('#navbarNav');
    // Fix 15: Check for Bootstrap's show class
    await expect(navCollapse).toHaveClass(/show/, { timeout: 5000 });
  });

  test('Mobile search accessibility', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Fix 16: Click hamburger first to reveal search on mobile
    const hamburger = page.locator('.navbar-toggler');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);
    }
    
    const searchBox = page.locator('#searchBox');
    await expect(searchBox).toBeVisible({ timeout: 5000 });
  });
});

// Performance tests in separate block to avoid interference
test.describe('Performance Tests', () => {
  test('Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(HTML_PATH, { waitUntil: 'domcontentloaded' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('Search responds quickly', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('domcontentloaded');
    
    const searchBox = page.locator('#searchBox');
    await searchBox.fill('TypeScript');
    
    // Fix 17: Measure time to first highlight
    const startTime = Date.now();
    await page.waitForSelector('mark.search-highlight', { timeout: 2000 });
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(1000);
  });
});