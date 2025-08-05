const { test, expect } = require('@playwright/test');

test.describe('Simple Fix Verification', () => {
  test('Check fixes are applied', async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check for questions
    const questions = await page.locator('.question-card').count();
    console.log(`Found ${questions} questions`);
    
    // Check for code blocks
    const codeBlocks = await page.locator('pre code').count();
    console.log(`Found ${codeBlocks} code blocks`);
    
    // Check for copy buttons
    const copyButtons = await page.locator('pre button').count();
    console.log(`Found ${copyButtons} copy buttons`);
    
    // Check for raw markdown
    const content = await page.content();
    const hasTripleBackticks = content.includes('```');
    console.log(`Has triple backticks: ${hasTripleBackticks}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/fixes-applied.png', fullPage: true });
    
    // Basic assertions
    expect(questions).toBeGreaterThan(0);
    expect(copyButtons).toBeGreaterThan(0);
  });
});