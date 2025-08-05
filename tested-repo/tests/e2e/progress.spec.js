import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show progress overview', async ({ page }) => {
    // Navigate to progress page
    await page.click('nav >> text=Progress');
    
    // Check progress elements
    await expect(page.locator('h2:has-text("Your Progress")')).toBeVisible();
    await expect(page.locator('.progress-bar')).toBeVisible();
    await expect(page.locator('.progress-percentage')).toBeVisible();
  });

  test('should show 0% progress initially', async ({ page }) => {
    await page.click('nav >> text=Progress');
    
    const percentage = page.locator('.progress-percentage');
    await expect(percentage).toHaveText('0%');
    
    const progressBar = page.locator('.progress-bar-fill');
    const width = await progressBar.evaluate(el => el.style.width);
    expect(width).toBe('0%');
  });

  test('should update progress when completing questions', async ({ page }) => {
    // Complete a question
    await page.click('.question-item:first-child');
    await page.click('button:has-text("Mark Complete")');
    
    // Go to progress page
    await page.click('nav >> text=Progress');
    
    // Check progress updated
    const percentage = page.locator('.progress-percentage');
    const percentText = await percentage.textContent();
    expect(parseInt(percentText)).toBeGreaterThan(0);
  });

  test('should show completed questions list', async ({ page }) => {
    // Complete some questions
    await page.click('.question-item:nth-child(1)');
    await page.click('button:has-text("Mark Complete")');
    await page.click('button:has-text("Back")');
    
    await page.click('.question-item:nth-child(2)');
    await page.click('button:has-text("Mark Complete")');
    
    // Go to progress page
    await page.click('nav >> text=Progress');
    
    // Check completed section
    await expect(page.locator('text=Completed Questions')).toBeVisible();
    const completedList = page.locator('.completed-questions-list');
    await expect(completedList).toBeVisible();
    
    const completedItems = completedList.locator('.completed-item');
    expect(await completedItems.count()).toBe(2);
  });

  test('should show bookmarked questions', async ({ page }) => {
    // Bookmark some questions
    await page.click('.question-item:nth-child(1)');
    await page.click('[aria-label="Bookmark"]');
    await page.click('button:has-text("Back")');
    
    await page.click('.question-item:nth-child(3)');
    await page.click('[aria-label="Bookmark"]');
    
    // Go to progress page
    await page.click('nav >> text=Progress');
    
    // Check bookmarked section
    await expect(page.locator('text=Bookmarked Questions')).toBeVisible();
    const bookmarkedList = page.locator('.bookmarked-questions-list');
    await expect(bookmarkedList).toBeVisible();
    
    const bookmarkedItems = bookmarkedList.locator('.bookmarked-item');
    expect(await bookmarkedItems.count()).toBe(2);
  });

  test('should show category breakdown', async ({ page }) => {
    await page.click('nav >> text=Progress');
    
    // Check category stats exist
    await expect(page.locator('text=Progress by Category')).toBeVisible();
    const categoryStats = page.locator('.category-stats');
    await expect(categoryStats).toBeVisible();
    
    // Check categories are listed
    const categories = categoryStats.locator('.category-stat');
    expect(await categories.count()).toBeGreaterThan(0);
  });

  test('should show difficulty breakdown', async ({ page }) => {
    await page.click('nav >> text=Progress');
    
    // Check difficulty stats exist
    await expect(page.locator('text=Progress by Difficulty')).toBeVisible();
    const difficultyStats = page.locator('.difficulty-stats');
    await expect(difficultyStats).toBeVisible();
    
    // Check difficulties are listed
    const difficulties = difficultyStats.locator('.difficulty-stat');
    expect(await difficulties.count()).toBe(3); // easy, medium, hard
  });

  test('should reset progress', async ({ page }) => {
    // Complete some questions
    await page.click('.question-item:first-child');
    await page.click('button:has-text("Mark Complete")');
    
    // Go to progress page
    await page.click('nav >> text=Progress');
    
    // Click reset button
    const resetButton = page.locator('button:has-text("Reset Progress")');
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    
    // Confirm reset
    await page.click('button:has-text("Confirm Reset")');
    
    // Check progress is reset
    await expect(page.locator('.progress-percentage')).toHaveText('0%');
  });

  test('should export progress data', async ({ page }) => {
    // Complete some questions
    await page.click('.question-item:first-child');
    await page.click('button:has-text("Mark Complete")');
    
    // Go to progress page
    await page.click('nav >> text=Progress');
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('button:has-text("Export Progress")');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('progress');
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('should show streak information', async ({ page }) => {
    await page.click('nav >> text=Progress');
    
    // Check streak display
    await expect(page.locator('.streak-info')).toBeVisible();
    await expect(page.locator('text=Current Streak')).toBeVisible();
    await expect(page.locator('.streak-days')).toHaveText('0 days');
  });

  test('should navigate to question from progress page', async ({ page }) => {
    // Complete a question
    await page.click('.question-item:first-child');
    const questionTitle = await page.locator('.question-title').textContent();
    await page.click('button:has-text("Mark Complete")');
    
    // Go to progress page
    await page.click('nav >> text=Progress');
    
    // Click on completed question
    await page.click('.completed-item:first-child');
    
    // Should navigate to that question
    await expect(page.locator('.question-detail')).toBeVisible();
    await expect(page.locator('.question-title')).toHaveText(questionTitle);
  });

  test('should show time spent statistics', async ({ page }) => {
    await page.click('nav >> text=Progress');
    
    // Check time stats
    await expect(page.locator('text=Time Statistics')).toBeVisible();
    await expect(page.locator('.total-time')).toBeVisible();
    await expect(page.locator('.average-time')).toBeVisible();
  });
});