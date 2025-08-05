const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;

// Test configuration
const HTML_PATH = 'file:///var/projects/interview_prep/index.html';
const MARKDOWN_PATH = '/var/projects/interview_prep/src/markdown/COMPLETE_TURING_INTERVIEW_GUIDE.md';

// Parallel test suite optimized for maximum performance
test.describe.configure({ mode: 'parallel' });

test.describe('Parallel Test Suite - Core Functionality', () => {
  test('Search functionality and highlighting', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const searchBox = page.locator('#searchBox');
    await searchBox.fill('Pulumi');
    await searchBox.press('Enter');
    
    // Verify search results
    const highlights = await page.locator('mark.search-highlight').count();
    expect(highlights).toBeGreaterThan(0);
    
    const searchInfo = page.locator('#searchInfo');
    await expect(searchInfo).toBeVisible();
  });

  test('Dark mode toggle', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const darkModeToggle = page.locator('#darkModeToggle');
    const body = page.locator('body');
    
    // Toggle dark mode
    await darkModeToggle.click();
    await expect(body).toHaveAttribute('data-theme', 'dark');
    
    // Toggle back
    await darkModeToggle.click();
    await expect(body).toHaveAttribute('data-theme', 'light');
  });

  test('Navigation menu functionality', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const sidebarNav = page.locator('#sidebarNav');
    await expect(sidebarNav).toBeVisible();
    
    const navItems = await sidebarNav.locator('li').count();
    expect(navItems).toBeGreaterThan(0);
    
    // Test navigation click
    const firstNavLink = sidebarNav.locator('a').first();
    await firstNavLink.click();
    
    // Verify scroll happened
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('Progress bar updates', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const progressBar = page.locator('#progressBar');
    const initialWidth = await progressBar.getAttribute('style');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(100);
    
    const newWidth = await progressBar.getAttribute('style');
    expect(newWidth).not.toBe(initialWidth);
  });
});

test.describe('Parallel Test Suite - Content Verification', () => {
  test('All 18 questions present', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('networkidle');
    
    // Check for question containers
    const questionCards = await page.locator('.question-card').count();
    expect(questionCards).toBeGreaterThanOrEqual(18);
  });

  test('Code blocks with syntax highlighting', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const codeBlocks = page.locator('pre code');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
    
    // Check for syntax highlighting classes
    const firstCodeBlock = codeBlocks.first();
    const hasHighlighting = await firstCodeBlock.locator('.token').count();
    expect(hasHighlighting).toBeGreaterThan(0);
  });

  test('Copy buttons on code blocks', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const copyButtons = page.locator('.copy-code');
    const count = await copyButtons.count();
    expect(count).toBeGreaterThan(0);
    
    // Test copy functionality
    const firstButton = copyButtons.first();
    await firstButton.hover();
    await expect(firstButton).toBeVisible();
  });

  test('STAR stories format', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    // Check for STAR story indicators
    const starKeywords = ['Situation:', 'Task:', 'Action:', 'Result:'];
    
    for (const keyword of starKeywords) {
      const elements = await page.locator(`text=${keyword}`).count();
      expect(elements).toBeGreaterThan(0);
    }
  });
});

test.describe('Parallel Test Suite - Mobile Responsiveness', () => {
  test('Mobile menu toggle', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(HTML_PATH);
    
    const mobileToggle = page.locator('.navbar-toggler');
    await expect(mobileToggle).toBeVisible();
    
    // Test toggle
    await mobileToggle.click();
    const navCollapse = page.locator('#navbarNav');
    await expect(navCollapse).toHaveClass(/show/);
  });

  test('Content readability on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(HTML_PATH);
    
    // Check if content is properly sized
    const contentContainer = page.locator('#contentContainer');
    const width = await contentContainer.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(375);
  });
});

test.describe('Parallel Test Suite - Performance', () => {
  test('Page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(HTML_PATH);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load quickly (under 3 seconds)
    expect(loadTime).toBeLessThan(3000);
  });

  test('Search performance', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const searchBox = page.locator('#searchBox');
    const startTime = Date.now();
    
    await searchBox.fill('TypeScript');
    await page.waitForTimeout(100); // Wait for debounce
    
    const searchTime = Date.now() - startTime;
    const highlights = await page.locator('mark.search-highlight').count();
    
    // Search should be fast (under 500ms)
    expect(searchTime).toBeLessThan(500);
    expect(highlights).toBeGreaterThan(0);
  });
});

test.describe('Parallel Test Suite - Edge Cases', () => {
  test('Empty search handling', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const searchBox = page.locator('#searchBox');
    await searchBox.fill('xyzxyzxyz12345');
    
    const searchInfo = page.locator('#searchInfo');
    await expect(searchInfo).toContainText('No matches found');
  });

  test('Rapid theme switching', async ({ page }) => {
    await page.goto(HTML_PATH);
    
    const darkModeToggle = page.locator('#darkModeToggle');
    const body = page.locator('body');
    
    // Rapid toggle
    for (let i = 0; i < 5; i++) {
      await darkModeToggle.click();
      await page.waitForTimeout(50);
    }
    
    // Should end on dark theme (odd number of clicks)
    await expect(body).toHaveAttribute('data-theme', 'dark');
  });

  test('Console error check', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(HTML_PATH);
    await page.waitForLoadState('networkidle');
    
    // No console errors should occur
    expect(errors).toHaveLength(0);
  });
});