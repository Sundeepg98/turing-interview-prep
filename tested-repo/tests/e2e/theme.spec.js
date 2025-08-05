import { test, expect } from '@playwright/test';

test.describe('Theme Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have theme toggle button', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
  });

  test('should toggle between light and dark theme', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Check initial theme (should be light by default)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Toggle to dark
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Toggle back to light
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('should persist theme preference', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Set dark theme
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Theme should still be dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('should respect system preference', async ({ page, browserName }) => {
    // This test is browser-specific due to how color scheme is handled
    if (browserName === 'chromium') {
      // Set dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      
      // Should use dark theme
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      
      // Set light mode preference
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      
      // Should use light theme
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    }
  });

  test('should override system preference with user choice', async ({ page, browserName }) => {
    if (browserName === 'chromium') {
      // Set system to dark
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      
      // User chooses light
      const themeToggle = page.locator('[aria-label="Toggle theme"]');
      await themeToggle.click();
      
      // Should be light despite system preference
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      
      // Reload and check persistence
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    }
  });

  test('should update theme colors correctly', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Get initial background color (light theme)
    const lightBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Switch to dark theme
    await themeToggle.click();
    
    // Get dark theme background
    const darkBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Colors should be different
    expect(lightBg).not.toBe(darkBg);
  });

  test('should update meta theme-color', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Check light theme meta color
    let metaThemeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
    expect(metaThemeColor).toBe('#ffffff');
    
    // Switch to dark
    await themeToggle.click();
    
    // Check dark theme meta color
    metaThemeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
    expect(metaThemeColor).toBe('#1a1a1a');
  });

  test('should maintain theme during navigation', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Set dark theme
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Navigate to different pages
    await page.click('nav >> text=Progress');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    await page.click('nav >> text=Search');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    await page.click('nav >> text=Questions');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('should handle theme toggle keyboard interaction', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Focus the button
    await themeToggle.focus();
    
    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Press Space to toggle back
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    
    // Check ARIA attributes
    await expect(themeToggle).toHaveAttribute('role', 'button');
    await expect(themeToggle).toHaveAttribute('aria-pressed', 'false');
    
    // Toggle theme
    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
  });
});