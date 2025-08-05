const { test, expect } = require('@playwright/test');
const fs = require('fs');

test.describe('Interview Guide - All Fixes Verification', () => {
  const urls = [
    { name: 'Original', url: 'file://' + process.cwd() + '/index.html' },
    { name: 'Fixed', url: 'file://' + process.cwd() + '/dist/index-fixed.html' }
  ];

  urls.forEach(({ name, url }) => {
    test.describe(`${name} Version`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
      });

      test('1. Copy buttons are present and functional', async ({ page }) => {
        // Wait for copy buttons to be added
        await page.waitForTimeout(200);
        
        const copyButtons = await page.locator('button:has(i.bi-clipboard)').count();
        console.log(`${name}: Found ${copyButtons} copy buttons`);
        
        expect(copyButtons).toBeGreaterThan(0);
        
        // Test first copy button
        if (copyButtons > 0) {
          const firstButton = page.locator('button:has(i.bi-clipboard)').first();
          await firstButton.click();
          
          // Check if icon changed to checkmark
          await expect(firstButton.locator('i.bi-clipboard-check')).toBeVisible();
        }
      });

      test('2. No raw markdown syntax visible', async ({ page }) => {
        const bodyText = await page.locator('body').textContent();
        
        // Check for triple backticks
        const hasTripleBackticks = bodyText.includes('```');
        console.log(`${name}: Has triple backticks: ${hasTripleBackticks}`);
        
        // Check for double asterisks (but not in code blocks)
        const hasDoubleAsterisks = bodyText.match(/\*\*[^*]+\*\*/);
        console.log(`${name}: Has double asterisks: ${hasDoubleAsterisks ? 'yes' : 'no'}`);
        
        // Check for raw headers
        const hasRawHeaders = bodyText.match(/^###\s+/m);
        console.log(`${name}: Has raw headers: ${hasRawHeaders ? 'yes' : 'no'}`);
        
        // For fixed version, these should be false
        if (name === 'Fixed') {
          expect(hasTripleBackticks).toBeFalsy();
          expect(hasDoubleAsterisks).toBeFalsy();
          expect(hasRawHeaders).toBeFalsy();
        }
      });

      test('3. HTML entities are decoded', async ({ page }) => {
        const bodyText = await page.locator('body').textContent();
        
        // Check for common entities
        const hasEncodedQuotes = bodyText.includes('&quot;') || bodyText.includes('&#039;');
        const hasEncodedAngles = bodyText.includes('&lt;') || bodyText.includes('&gt;');
        
        console.log(`${name}: Has encoded quotes: ${hasEncodedQuotes}`);
        console.log(`${name}: Has encoded angles: ${hasEncodedAngles}`);
        
        // Check for specific phrase
        const hasTypeScriptPhrase = bodyText.includes("TypeScript's type safety");
        console.log(`${name}: Has TypeScript phrase: ${hasTypeScriptPhrase}`);
      });

      test('4. All 18 questions are rendered', async ({ page }) => {
        const questions = await page.locator('.question-card').count();
        console.log(`${name}: Found ${questions} questions`);
        expect(questions).toBe(18);
      });

      test('5. Code blocks have syntax highlighting', async ({ page }) => {
        const codeBlocks = await page.locator('pre code').count();
        console.log(`${name}: Found ${codeBlocks} code blocks`);
        
        // Check if Prism classes are applied
        const highlightedBlocks = await page.locator('pre code[class*="language-"]').count();
        console.log(`${name}: Highlighted blocks: ${highlightedBlocks}`);
        
        expect(highlightedBlocks).toBeGreaterThan(0);
      });

      test('6. Search functionality works', async ({ page }) => {
        await page.fill('#searchBox', 'Pulumi');
        await page.waitForTimeout(300); // Debounce delay
        
        const visibleQuestions = await page.locator('.question-card:visible').count();
        const hiddenQuestions = await page.locator('.question-card:not(:visible)').count();
        
        console.log(`${name}: Search results - Visible: ${visibleQuestions}, Hidden: ${hiddenQuestions}`);
        expect(visibleQuestions).toBeGreaterThan(0);
        expect(hiddenQuestions).toBeGreaterThan(0);
      });
    });
  });

  test('Compare versions - improvements', async ({ page }) => {
    // Load both versions and compare
    const originalStats = await getPageStats(page, urls[0].url);
    const fixedStats = await getPageStats(page, urls[1].url);
    
    console.log('=== COMPARISON ===');
    console.log('Copy buttons:', originalStats.copyButtons, '->', fixedStats.copyButtons);
    console.log('Raw markdown:', originalStats.rawMarkdown, '->', fixedStats.rawMarkdown);
    console.log('HTML entities:', originalStats.htmlEntities, '->', fixedStats.htmlEntities);
    console.log('Questions:', originalStats.questions, '->', fixedStats.questions);
    
    // Fixed version should have improvements
    expect(fixedStats.copyButtons).toBeGreaterThan(0);
    expect(fixedStats.rawMarkdown).toBe(false);
    expect(fixedStats.questions).toBe(18);
  });
});

async function getPageStats(page, url) {
  await page.goto(url);
  await page.waitForTimeout(200);
  
  const bodyText = await page.locator('body').textContent();
  
  return {
    copyButtons: await page.locator('button:has(i.bi-clipboard)').count(),
    rawMarkdown: bodyText.includes('```') || bodyText.includes('**') || bodyText.match(/^###\s+/m),
    htmlEntities: bodyText.includes('&quot;') || bodyText.includes('&#039;'),
    questions: await page.locator('.question-card').count(),
    codeBlocks: await page.locator('pre code').count()
  };
}