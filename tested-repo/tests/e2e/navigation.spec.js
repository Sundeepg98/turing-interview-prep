import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Interview Prep/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for main navigation items
    await expect(nav.locator('text=Questions')).toBeVisible();
    await expect(nav.locator('text=Progress')).toBeVisible();
    await expect(nav.locator('text=Search')).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    // Click on Progress
    await page.click('nav >> text=Progress');
    await expect(page.locator('h2:has-text("Your Progress")')).toBeVisible();

    // Click on Questions
    await page.click('nav >> text=Questions');
    await expect(page.locator('.questions-list')).toBeVisible();
  });

  test('should handle back/forward navigation', async ({ page }) => {
    // Navigate to different sections
    await page.click('nav >> text=Progress');
    await page.click('nav >> text=Search');
    
    // Go back
    await page.goBack();
    await expect(page.locator('h2:has-text("Your Progress")')).toBeVisible();
    
    // Go forward
    await page.goForward();
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test('should show 404 for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('should have responsive navigation on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check for hamburger menu
      const hamburger = page.locator('.menu-toggle');
      await expect(hamburger).toBeVisible();
      
      // Open mobile menu
      await hamburger.click();
      await expect(page.locator('nav')).toBeVisible();
      
      // Navigate on mobile
      await page.click('nav >> text=Questions');
      await expect(page.locator('.questions-list')).toBeVisible();
    }
  });
});