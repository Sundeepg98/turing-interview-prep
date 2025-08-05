const { test, expect } = require('@playwright/test');

test.describe('Detailed Feature Test', () => {
  test('Test all features in detail', async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== DETAILED FEATURE TEST ===\n');
    
    // 1. SEARCH FEATURE
    console.log('1. SEARCH FUNCTIONALITY:');
    const searchBox = await page.locator('#searchBox');
    await searchBox.fill('TypeScript');
    await page.waitForTimeout(1000);
    
    // Check if search works
    const searchHighlights = await page.locator('.search-highlight, mark').count();
    console.log(`   Search for "TypeScript": ${searchHighlights} highlights`);
    
    // Clear search
    const clearButton = await page.locator('#clearSearch');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      console.log(`   Clear button: ✓ Working`);
    }
    
    // 2. NAVIGATION
    console.log('\n2. NAVIGATION:');
    // Click on a nav item
    const navLink = await page.locator('#sidebarNav a').nth(2); // 3rd item
    const navText = await navLink.textContent();
    await navLink.click();
    await page.waitForTimeout(500);
    
    // Check if it scrolled
    const scrollY = await page.evaluate(() => window.scrollY);
    console.log(`   Clicked: ${navText.trim()}`);
    console.log(`   Page scrolled: ${scrollY > 0 ? '✓' : '❌'} (Y: ${scrollY})`);
    
    // 3. DARK MODE - More detailed check
    console.log('\n3. DARK MODE:');
    
    // Initial state
    const initialDataTheme = await page.getAttribute('body', 'data-theme');
    const initialBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`   Initial data-theme: ${initialDataTheme || 'not set'}`);
    console.log(`   Initial bg-color: ${initialBgColor}`);
    
    // Click dark mode toggle
    const darkToggle = await page.locator('#darkModeToggle');
    await darkToggle.click();
    await page.waitForTimeout(1500);
    
    // Check changes
    const newDataTheme = await page.getAttribute('body', 'data-theme');
    const newBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    const iconClass = await page.locator('#darkModeToggle i').getAttribute('class');
    
    console.log(`   After toggle data-theme: ${newDataTheme}`);
    console.log(`   After toggle bg-color: ${newBgColor}`);
    console.log(`   Icon changed: ${iconClass.includes('sun') ? '✓ (showing sun)' : '❌'}`);
    console.log(`   Theme changed: ${initialBgColor !== newBgColor ? '✓' : '❌'}`);
    
    // 4. COPY BUTTONS
    console.log('\n4. COPY BUTTONS:');
    const copyButtons = await page.locator('pre button').count();
    console.log(`   Total copy buttons: ${copyButtons}`);
    
    if (copyButtons > 0) {
      const firstCopyBtn = await page.locator('pre button').first();
      
      // Mock clipboard API for testing
      await page.evaluate(() => {
        navigator.clipboard = {
          writeText: () => Promise.resolve()
        };
      });
      
      await firstCopyBtn.click();
      await page.waitForTimeout(500);
      const btnIcon = await firstCopyBtn.locator('i').getAttribute('class');
      console.log(`   Copy button clicked: ${btnIcon.includes('check') ? '✓ (shows check)' : '❌'}`);
    }
    
    // 5. RESPONSIVE CHECK
    console.log('\n5. RESPONSIVE DESIGN:');
    
    // Check mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileMenuToggle = await page.locator('.navbar-toggler');
    const isToggleVisible = await mobileMenuToggle.isVisible();
    console.log(`   Mobile menu toggle visible: ${isToggleVisible ? '✓' : '❌'}`);
    
    if (isToggleVisible) {
      await mobileMenuToggle.click();
      await page.waitForTimeout(500);
      const menuExpanded = await page.locator('#navbarNav.show').count() > 0;
      console.log(`   Mobile menu expands: ${menuExpanded ? '✓' : '❌'}`);
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('\n=== END OF DETAILED TEST ===\n');
    
    // Take final screenshots
    await page.screenshot({ path: 'test-results/features-light.png', fullPage: false });
    await darkToggle.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/features-dark.png', fullPage: false });
  });
});