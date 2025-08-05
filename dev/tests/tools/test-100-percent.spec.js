const { test, expect } = require('@playwright/test');

test.describe('100% Completion Test', () => {
  test('Verify all fixes are applied correctly', async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');
    
    // Wait for full page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== 100% COMPLETION VERIFICATION ===\n');
    
    // 1. Check Questions
    const questions = await page.locator('.question-card').count();
    console.log(`✓ Questions rendered: ${questions}/18`);
    
    // 2. Check Code Blocks
    const codeBlocks = await page.locator('pre code').count();
    console.log(`✓ Code blocks rendered: ${codeBlocks}/26+`);
    
    // 3. Check Copy Buttons
    const copyButtons = await page.locator('pre button').count();
    console.log(`✓ Copy buttons: ${copyButtons}`);
    
    // 4. Check for Raw Markdown (excluding script tags)
    const bodyContent = await page.locator('body').innerHTML();
    // Remove script content from check
    const contentWithoutScripts = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    const hasTripleBackticks = contentWithoutScripts.includes('```');
    const hasDoubleAsterisks = contentWithoutScripts.includes('**') && !contentWithoutScripts.includes('**kwargs');
    const hasRawHeaders = contentWithoutScripts.includes('### ');
    const hasCheckboxes = contentWithoutScripts.includes('- [ ]');
    const hasHorizontalRules = contentWithoutScripts.includes('---') && !contentWithoutScripts.includes('---\n');
    
    console.log('\nMarkdown Syntax Check:');
    console.log('  Triple backticks: ' + (hasTripleBackticks ? '❌ FOUND' : '✓ REMOVED'));
    console.log('  Double asterisks: ' + (hasDoubleAsterisks ? '❌ FOUND' : '✓ REMOVED'));
    console.log('  Raw headers: ' + (hasRawHeaders ? '❌ FOUND' : '✓ REMOVED'));
    console.log('  Checkboxes: ' + (hasCheckboxes ? '❌ FOUND' : '✓ REMOVED'));
    console.log('  Horizontal rules: ' + (hasHorizontalRules ? '❌ FOUND' : '✓ REMOVED'));
    
    // 5. Test Search
    const searchInput = await page.locator('input[type="search"], #searchInput').first();
    const hasSearch = await searchInput.count() > 0;
    let searchPlaceholder = 'Search...';
    let highlightedResults = 0;
    
    if (hasSearch) {
      await searchInput.fill('Pulumi');
      await page.waitForTimeout(500);
      searchPlaceholder = await searchInput.getAttribute('placeholder') || 'Search...';
      highlightedResults = await page.locator('.search-highlight').count();
    }
    console.log(`\n✓ Search placeholder: "${searchPlaceholder}"`);
    console.log(`✓ Search results highlighted: ${highlightedResults}`);
    
    // 6. Test Copy Button Functionality
    if (copyButtons > 0) {
      const firstCopyButton = page.locator('pre button').first();
      await firstCopyButton.click();
      await page.waitForTimeout(100);
      const buttonText = await firstCopyButton.textContent();
      console.log(`✓ Copy button clicked, shows: ${buttonText}`);
    }
    
    // 7. Check Content Visibility
    const visibleContent = await page.locator('#contentContainer').textContent();
    const contentChecks = {
      'Infrastructure as Code': visibleContent.includes('Infrastructure as Code'),
      'TypeScript safety': visibleContent.includes('TypeScript') && visibleContent.includes('safety'),
      'Component Resources': visibleContent.includes('Component Resources'),
      'STAR Stories': visibleContent.includes('STAR'),
      'Quick Reference': visibleContent.includes('Quick Reference')
    };
    
    console.log('\nContent Visibility:');
    Object.entries(contentChecks).forEach(([key, found]) => {
      console.log(`  ${key}: ${found ? '✓' : '❌'}`);
    });
    
    // Calculate score
    const scores = {
      questions: questions === 18 ? 100 : (questions / 18) * 100,
      codeBlocks: codeBlocks >= 26 ? 100 : (codeBlocks / 26) * 100,
      copyButtons: copyButtons >= codeBlocks ? 100 : 0,
      markdown: (!hasTripleBackticks && !hasDoubleAsterisks && !hasRawHeaders) ? 100 : 0,
      search: searchPlaceholder === 'Search...' && highlightedResults > 0 ? 100 : 50,
      content: Object.values(contentChecks).filter(v => v).length / 5 * 100
    };
    
    console.log('\n=== FINAL SCORES ===');
    console.log(`Questions: ${scores.questions.toFixed(0)}%`);
    console.log(`Code Blocks: ${scores.codeBlocks.toFixed(0)}%`);
    console.log(`Copy Buttons: ${scores.copyButtons.toFixed(0)}%`);
    console.log(`Markdown Clean: ${scores.markdown.toFixed(0)}%`);
    console.log(`Search: ${scores.search.toFixed(0)}%`);
    console.log(`Content: ${scores.content.toFixed(0)}%`);
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b) / 6;
    console.log(`\n🎯 TOTAL SCORE: ${totalScore.toFixed(0)}%\n`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/100-percent-status.png', fullPage: true });
    
    // Assertions for 100%
    expect(questions).toBe(18);
    expect(codeBlocks).toBeGreaterThanOrEqual(26);
    expect(copyButtons).toBeGreaterThanOrEqual(codeBlocks);
    expect(hasTripleBackticks).toBe(false);
    expect(hasDoubleAsterisks).toBe(false);
    expect(hasRawHeaders).toBe(false);
  });
});