const { test, expect } = require('@playwright/test');

test.describe('Interview Prep Dynamic HTML', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8082/interview-prep-dynamic.html');
  });

  test('should load the page', async ({ page }) => {
    await expect(page).toHaveTitle('Dynamic Interview Prep Guide');
    await expect(page.locator('h1')).toContainText('Pulumi TypeScript Interview Guide');
  });

  test('should load markdown content', async ({ page }) => {
    // Wait for loading message to disappear
    await page.waitForSelector('#loadingMessage', { state: 'hidden', timeout: 10000 });
    
    // Check if questions loaded
    const questionsContainer = page.locator('#questionsContainer');
    await expect(questionsContainer).toBeVisible();
    
    // Check if any question items exist
    const questions = page.locator('.question-item');
    const count = await questions.count();
    console.log(`Found ${count} questions/sections`);
    expect(count).toBeGreaterThan(0);
  });

  test('should have working search', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('#loadingMessage', { state: 'hidden' });
    
    // Type in search
    await page.fill('#searchInput', 'TypeScript');
    
    // Check filtered results
    const visibleQuestions = page.locator('.question-item:visible');
    const count = await visibleQuestions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.locator('#themeToggle');
    await themeButton.click();
    
    // Check if theme changed
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should expand question content', async ({ page }) => {
    await page.waitForSelector('#loadingMessage', { state: 'hidden' });
    
    // Click first expand button
    const expandButton = page.locator('.action-btn').filter({ hasText: '📖' }).first();
    await expandButton.click();
    
    // Check if content expanded
    const content = page.locator('.question-content').first();
    await expect(content).toHaveClass(/expanded/);
  });
});