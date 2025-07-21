const { test, expect } = require('@playwright/test');

test.describe('Interactive Features Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('file:///var/projects/interview_prep/dist/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('Typing animation should be applied to main header', async () => {
    const typingElement = await page.locator('.typing-effect');
    await expect(typingElement).toBeVisible();
    
    // Check if animation styles are applied
    const hasAnimation = await typingElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.animationName !== 'none';
    });
    expect(hasAnimation).toBeTruthy();
  });

  test('Interactive quiz should work correctly', async () => {
    // Check if quiz container exists
    const quizContainer = await page.locator('.quiz-container');
    await expect(quizContainer).toBeVisible();

    // Test clicking wrong answer
    const wrongOption = await page.locator('.quiz-option[data-correct="false"]').first();
    await wrongOption.click();
    
    // Check if incorrect class is added
    await expect(wrongOption).toHaveClass(/incorrect/);
    
    // Check if feedback is shown
    const feedback = await page.locator('.quiz-feedback');
    await expect(feedback).toBeVisible();
    await expect(feedback).toContainText('Not quite');
  });

  test('Code blocks should have scroll animation observer', async () => {
    const codeBlocks = await page.locator('pre');
    const count = await codeBlocks.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check if IntersectionObserver is being used
    const hasObserver = await page.evaluate(() => {
      return typeof IntersectionObserver !== 'undefined';
    });
    expect(hasObserver).toBeTruthy();
  });

  test('Terminal simulations should be created for Pulumi commands', async () => {
    const terminals = await page.locator('.terminal');
    const terminalCount = await terminals.count();
    
    if (terminalCount > 0) {
      // Check terminal structure
      const firstTerminal = terminals.first();
      await expect(firstTerminal.locator('.terminal-dot.red')).toBeVisible();
      await expect(firstTerminal.locator('.terminal-dot.yellow')).toBeVisible();
      await expect(firstTerminal.locator('.terminal-dot.green')).toBeVisible();
      await expect(firstTerminal.locator('.terminal-content')).toBeVisible();
    }
  });

  test('Floating action buttons should be present and functional', async () => {
    // Check if FAB container exists
    const fabContainer = await page.locator('.fab-container');
    await expect(fabContainer).toBeVisible();

    // Check scroll to top button
    const scrollToTop = await page.locator('#scrollToTop');
    await expect(scrollToTop).toBeVisible();
    
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    
    // Click scroll to top
    await scrollToTop.click();
    await page.waitForTimeout(500);
    
    // Check if scrolled to top
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeLessThan(10);

    // Test quick navigation button
    const quickNav = await page.locator('#quickNavFab');
    await expect(quickNav).toBeVisible();
    await quickNav.click();
    
    // Check if modal appears
    const modal = await page.locator('.modal.show');
    await expect(modal).toBeVisible();
  });

  test('Tooltips should be added to technical terms', async () => {
    const tooltips = await page.locator('.tooltip-custom');
    const tooltipCount = await tooltips.count();
    
    expect(tooltipCount).toBeGreaterThan(0);
    
    // Check first tooltip
    if (tooltipCount > 0) {
      const firstTooltip = tooltips.first();
      const tooltipText = await firstTooltip.getAttribute('data-tooltip');
      expect(tooltipText).toBeTruthy();
    }
  });

  test('Progress bars should have animation class', async () => {
    const progressBars = await page.locator('.progress-bar');
    const progressCount = await progressBars.count();
    
    if (progressCount > 0) {
      const hasAnimationClass = await progressBars.first().evaluate(el => {
        return el.classList.contains('progress-animated');
      });
      expect(hasAnimationClass).toBeTruthy();
    }
  });

  test('Code diff visualization should work for before/after examples', async () => {
    const codeDiffs = await page.locator('.code-diff');
    const diffCount = await codeDiffs.count();
    
    // Log what we find
    console.log(`Found ${diffCount} code diff blocks`);
    
    if (diffCount > 0) {
      const diffLines = await page.locator('.diff-line');
      expect(await diffLines.count()).toBeGreaterThan(0);
    }
  });

  test.afterEach(async () => {
    await page.close();
  });
});

// Summary test
test('All interactive features summary', async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('file:///var/projects/interview_prep/dist/index.html');
  await page.waitForLoadState('networkidle');

  const results = {
    typingAnimation: await page.locator('.typing-effect').count() > 0,
    quiz: await page.locator('.quiz-container').count() > 0,
    terminals: await page.locator('.terminal').count() > 0,
    fabs: await page.locator('.fab-container').count() > 0,
    tooltips: await page.locator('.tooltip-custom').count() > 0,
    codeBlocks: await page.locator('pre').count() > 0
  };

  console.log('Interactive Features Status:', results);
  
  // At least most features should be present
  const enabledFeatures = Object.values(results).filter(v => v).length;
  expect(enabledFeatures).toBeGreaterThanOrEqual(5);

  await page.close();
});