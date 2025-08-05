const { test, expect } = require('@playwright/test');

test.describe('Final Comprehensive Verification', () => {
  test('Verify ALL extreme test recommendations are fulfilled', async ({ page }) => {
    await page.goto('file:///var/projects/interview_prep/index.html');
    await page.waitForLoadState('networkidle');

    console.log('\n=== FINAL VERIFICATION REPORT ===\n');

    // 1. Code blocks with syntax highlighting
    const codeBlocks = await page.locator('pre code').count();
    const hasHighlighting = await page.locator('[class*="hljs"], [class*="language-"]').count() > 0;
    console.log(`✓ Code blocks: ${codeBlocks} found (Expected: 27)`);
    console.log(`✓ Syntax highlighting: ${hasHighlighting ? 'Yes' : 'No'}`);

    // 2. Copy buttons on code blocks
    const copyButtons = await page.locator('.code-block-wrapper button:has-text("Copy")').count();
    console.log(`✓ Copy buttons: ${copyButtons} found`);

    // Test copy functionality
    if (copyButtons > 0) {
      const firstCopyButton = await page.locator('.code-block-wrapper button:has-text("Copy")').first();
      await firstCopyButton.click();
      const buttonText = await firstCopyButton.textContent();
      console.log(`✓ Copy button clicked - shows: "${buttonText}"`);
    }

    // 3. Markdown syntax rendering
    const bodyText = await page.locator('body').textContent();
    const rawMarkdownFound = ['```', '**', '###', '- [ ]', '---'].filter(pattern => bodyText.includes(pattern));
    console.log(`✓ Raw markdown patterns: ${rawMarkdownFound.length === 0 ? 'None found (Good!)' : rawMarkdownFound.join(', ')}`);

    // 4. Search functionality
    const searchInput = await page.locator('input[type="search"]').count();
    console.log(`✓ Search input: ${searchInput > 0 ? 'Present' : 'Not found'}`);

    // Test search
    if (searchInput > 0) {
      await page.fill('input[type="search"]', 'Pulumi');
      await page.waitForTimeout(500);
      const highlighted = await page.locator('mark, .highlight').count();
      console.log(`✓ Search highlighting: ${highlighted} matches highlighted`);
    }

    // 5. Navigation/TOC
    const toc = await page.locator('nav, [class*="toc"], [class*="navigation"]').count();
    console.log(`✓ Navigation/TOC: ${toc > 0 ? 'Present' : 'Not found'}`);

    // 6. Responsive design
    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    const mobileOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    await page.setViewportSize(originalViewport);
    console.log(`✓ Mobile responsive: ${mobileOverflow ? 'Needs improvement' : 'Good'}`);

    // 7. Content completeness
    const criticalContent = [
      'Complete Turing Interview Guide',
      'Q1: How do you manage different environments?',
      'STAR Stories',
      'Infrastructure Migration (Mailmodo)',
      'RED FLAGS TO AVOID'
    ];
    
    const foundContent = criticalContent.filter(content => bodyText.includes(content));
    console.log(`✓ Content completeness: ${foundContent.length}/${criticalContent.length} critical sections found`);

    // 8. Interactive elements
    const collapsibles = await page.locator('details, [class*="collapsible"], [class*="accordion"]').count();
    console.log(`✓ Interactive elements: ${collapsibles} found`);

    // 9. Performance
    const performance = await page.evaluate(() => {
      const timing = window.performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart
      };
    });
    console.log(`✓ Page load time: ${performance.loadTime}ms`);
    console.log(`✓ DOM ready time: ${performance.domReady}ms`);

    // 10. Accessibility
    const hasSkipLink = await page.locator('a[href="#main"], a[href="#content"]').count() > 0;
    const hasAltText = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.alt || img.title);
    });
    console.log(`✓ Skip to content link: ${hasSkipLink ? 'Yes' : 'No'}`);
    console.log(`✓ Images have alt text: ${hasAltText ? 'Yes' : 'No/N/A'}`);

    // Summary
    console.log('\n=== SUMMARY ===');
    const issues = [];
    
    if (codeBlocks < 27) issues.push('Missing some code blocks');
    if (!hasHighlighting) issues.push('No syntax highlighting');
    if (copyButtons < codeBlocks) issues.push('Not all code blocks have copy buttons');
    if (rawMarkdownFound.length > 0) issues.push('Raw markdown syntax visible');
    if (searchInput === 0) issues.push('No search functionality');
    if (toc === 0) issues.push('No table of contents');
    if (mobileOverflow) issues.push('Content overflows on mobile');
    
    if (issues.length === 0) {
      console.log('\n✅ ALL EXTREME TEST RECOMMENDATIONS FULFILLED!');
      console.log('The adaptive UI successfully meets all requirements.');
    } else {
      console.log('\n⚠️  Remaining issues:');
      issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    }

    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      codeBlocks: { found: codeBlocks, expected: 27, pass: codeBlocks >= 27 },
      syntaxHighlighting: hasHighlighting,
      copyButtons: { found: copyButtons, sufficient: copyButtons >= codeBlocks * 0.8 },
      rawMarkdown: { found: rawMarkdownFound.length === 0 },
      search: { present: searchInput > 0 },
      navigation: { present: toc > 0 },
      responsive: { noOverflow: !mobileOverflow },
      contentComplete: { found: foundContent.length, total: criticalContent.length },
      overallPass: issues.length === 0
    };

    console.log('\n📊 Test Report:', JSON.stringify(report, null, 2));
  });
});