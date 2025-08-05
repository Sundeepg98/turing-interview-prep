import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('should search questions by keyword', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type search query
    await searchInput.fill('typescript');
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForSelector('.search-results');
    
    // Check results contain typescript
    const results = page.locator('.search-result-item');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify results contain search term
    for (let i = 0; i < count; i++) {
      const text = await results.nth(i).textContent();
      expect(text.toLowerCase()).toContain('typescript');
    }
  });

  test('should show no results message', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Search for non-existent term
    await searchInput.fill('xyznonexistent123');
    await searchInput.press('Enter');
    
    // Check no results message
    await expect(page.locator('text=No results found')).toBeVisible();
  });

  test('should highlight search terms', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Search
    await searchInput.fill('pulumi');
    await searchInput.press('Enter');
    
    // Check highlights
    await page.waitForSelector('mark');
    const highlights = page.locator('mark');
    const count = await highlights.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify highlighted text
    const highlightedText = await highlights.first().textContent();
    expect(highlightedText.toLowerCase()).toBe('pulumi');
  });

  test('should show search suggestions', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Start typing
    await searchInput.fill('typ');
    
    // Wait for suggestions
    await page.waitForSelector('.search-suggestions');
    const suggestions = page.locator('.search-suggestion');
    
    // Check suggestions appear
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);
    
    // Click a suggestion
    await suggestions.first().click();
    
    // Check input is filled with suggestion
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBeTruthy();
  });

  test('should clear search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Perform search
    await searchInput.fill('react');
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForSelector('.search-results');
    
    // Clear search
    const clearButton = page.locator('[aria-label="Clear search"]');
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    
    // Check search is cleared
    await expect(searchInput).toHaveValue('');
    await expect(page.locator('.search-results')).not.toBeVisible();
  });

  test('should navigate to question from search results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Search
    await searchInput.fill('hooks');
    await searchInput.press('Enter');
    
    // Click first result
    await page.click('.search-result-item:first-child');
    
    // Check navigated to question detail
    await expect(page.locator('.question-detail')).toBeVisible();
    await expect(page.locator('.question-content')).toContainText(/hooks/i);
  });

  test('should persist search on navigation', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Perform search
    await searchInput.fill('kubernetes');
    await searchInput.press('Enter');
    
    // Navigate away
    await page.click('nav >> text=Progress');
    
    // Navigate back
    await page.click('nav >> text=Search');
    
    // Check search is preserved
    await expect(searchInput).toHaveValue('kubernetes');
    await expect(page.locator('.search-results')).toBeVisible();
  });

  test('should handle special characters in search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Search with special characters
    await searchInput.fill('C++');
    await searchInput.press('Enter');
    
    // Should not throw error
    await page.waitForTimeout(500);
    
    // Check for results or no results message
    const hasResults = await page.locator('.search-result-item').count() > 0;
    const hasNoResults = await page.locator('text=No results found').isVisible();
    
    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('should search with filters', async ({ page }) => {
    // Apply category filter
    await page.selectOption('select[name="category"]', 'DevOps');
    
    // Search within category
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('infrastructure');
    await searchInput.press('Enter');
    
    // Check results are filtered
    const results = page.locator('.search-result-item');
    const count = await results.count();
    
    for (let i = 0; i < count; i++) {
      const category = await results.nth(i).locator('.result-category').textContent();
      expect(category).toBe('DevOps');
    }
  });
});