import { test, expect } from '@playwright/test';

test.describe('Questions Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display list of questions', async ({ page }) => {
    const questionsList = page.locator('.questions-list');
    await expect(questionsList).toBeVisible();
    
    // Check that questions are loaded
    const questions = page.locator('.question-item');
    await expect(questions).toHaveCount(await questions.count());
    expect(await questions.count()).toBeGreaterThan(0);
  });

  test('should show question details on click', async ({ page }) => {
    // Click first question
    await page.click('.question-item:first-child');
    
    // Check question detail view
    await expect(page.locator('.question-detail')).toBeVisible();
    await expect(page.locator('.question-title')).toBeVisible();
    await expect(page.locator('.question-content')).toBeVisible();
  });

  test('should mark question as completed', async ({ page }) => {
    // Open first question
    await page.click('.question-item:first-child');
    
    // Mark as completed
    const completeButton = page.locator('button:has-text("Mark Complete")');
    await expect(completeButton).toBeVisible();
    await completeButton.click();
    
    // Check button state changed
    await expect(page.locator('button:has-text("Completed")')).toBeVisible();
    
    // Check progress is saved
    await page.reload();
    await page.click('.question-item:first-child');
    await expect(page.locator('button:has-text("Completed")')).toBeVisible();
  });

  test('should bookmark questions', async ({ page }) => {
    // Open first question
    await page.click('.question-item:first-child');
    
    // Click bookmark
    const bookmarkButton = page.locator('[aria-label="Bookmark"]');
    await expect(bookmarkButton).toBeVisible();
    await bookmarkButton.click();
    
    // Check bookmark is active
    await expect(bookmarkButton).toHaveClass(/bookmarked/);
    
    // Check bookmark persists
    await page.reload();
    await page.click('.question-item:first-child');
    await expect(page.locator('[aria-label="Bookmark"]')).toHaveClass(/bookmarked/);
  });

  test('should filter questions by category', async ({ page }) => {
    // Click category filter
    const categoryFilter = page.locator('select[name="category"]');
    await expect(categoryFilter).toBeVisible();
    
    // Select a category
    await categoryFilter.selectOption('TypeScript');
    
    // Check filtered results
    const questions = page.locator('.question-item');
    const count = await questions.count();
    
    for (let i = 0; i < count; i++) {
      const category = await questions.nth(i).locator('.question-category').textContent();
      expect(category).toBe('TypeScript');
    }
  });

  test('should navigate between questions', async ({ page }) => {
    // Open first question
    await page.click('.question-item:first-child');
    
    // Check navigation buttons
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    
    // Get first question title
    const firstTitle = await page.locator('.question-title').textContent();
    
    // Navigate to next
    await nextButton.click();
    
    // Check different question is shown
    const secondTitle = await page.locator('.question-title').textContent();
    expect(secondTitle).not.toBe(firstTitle);
    
    // Navigate back
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    
    // Check we're back to first question
    const currentTitle = await page.locator('.question-title').textContent();
    expect(currentTitle).toBe(firstTitle);
  });

  test('should show code syntax highlighting', async ({ page }) => {
    // Find a question with code
    const codeQuestions = page.locator('.question-item:has(.has-code)');
    
    if (await codeQuestions.count() > 0) {
      await codeQuestions.first().click();
      
      // Check for syntax highlighted code
      const codeBlock = page.locator('pre code');
      await expect(codeBlock).toBeVisible();
      
      // Check for syntax highlighting classes
      const highlighted = await codeBlock.locator('.token').count();
      expect(highlighted).toBeGreaterThan(0);
    }
  });

  test('should copy code blocks', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-write']);
    
    // Find question with code
    const codeQuestions = page.locator('.question-item:has(.has-code)');
    
    if (await codeQuestions.count() > 0) {
      await codeQuestions.first().click();
      
      // Click copy button
      const copyButton = page.locator('.copy-code-button').first();
      await expect(copyButton).toBeVisible();
      await copyButton.click();
      
      // Check copy feedback
      await expect(page.locator('text=Copied!')).toBeVisible();
    }
  });
});