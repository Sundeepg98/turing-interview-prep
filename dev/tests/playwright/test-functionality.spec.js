const { test, expect } = require('@playwright/test');

test.describe('Functionality Verification', () => {
  test('Check search, menu, and dark mode', async ({ page }) => {
    await page.goto('file:///var/projects/interview_prep/index.html');
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== FUNCTIONALITY CHECK ===\n');
    
    // 1. Check Search Functionality
    console.log('1. SEARCH FUNCTIONALITY:');
    const searchInput = await page.locator('#searchBox').first();
    const hasSearchInput = await searchInput.count() > 0;
    console.log(`   Search input exists: ${hasSearchInput ? '✓' : '❌'}`);
    
    if (hasSearchInput) {
      // Test search
      await searchInput.fill('Pulumi');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const highlights = await page.locator('mark.search-highlight').count();
      console.log(`   Search highlights found: ${highlights}`);
      
      // Check if results are visible
      const searchInfo = await page.locator('#searchInfo').count();
      console.log(`   Search info display: ${searchInfo > 0 ? '✓' : '❌'}`);
    }
    
    // 2. Check Navigation Menu
    console.log('\n2. NAVIGATION MENU:');
    const sidebarNav = await page.locator('#sidebarNav').count();
    console.log(`   Sidebar navigation exists: ${sidebarNav > 0 ? '✓' : '❌'}`);
    
    const navItems = await page.locator('#sidebarNav li').count();
    console.log(`   Navigation items: ${navItems}`);
    
    // Test navigation click
    if (navItems > 0) {
      const firstNavItem = await page.locator('#sidebarNav a').first();
      const navText = await firstNavItem.textContent();
      console.log(`   First nav item: "${navText}"`);
      
      // Click and check if it scrolls
      await firstNavItem.click();
      await page.waitForTimeout(500);
      console.log(`   Navigation click: ✓`);
    }
    
    // 3. Check Dark Mode Toggle
    console.log('\n3. DARK MODE TOGGLE:');
    const darkModeToggle = await page.locator('#darkModeToggle').first();
    const hasToggle = await darkModeToggle.count() > 0;
    console.log(`   Dark mode toggle exists: ${hasToggle ? '✓' : '❌'}`);
    
    if (hasToggle) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.body.getAttribute('data-theme') || 'light';
      });
      console.log(`   Initial theme: ${initialTheme}`);
      
      // Click toggle
      await darkModeToggle.click();
      await page.waitForTimeout(1000);
      
      // Check if theme changed
      const newTheme = await page.evaluate(() => {
        return document.body.getAttribute('data-theme') || 'light';
      });
      console.log(`   After toggle: ${newTheme}`);
      console.log(`   Theme changed: ${initialTheme !== newTheme ? '✓' : '❌'}`);
      
      // Toggle back
      await darkModeToggle.click();
      await page.waitForTimeout(500);
    }
    
    // 4. Additional Checks
    console.log('\n4. ADDITIONAL FEATURES:');
    
    // Check if content is scrollable
    const mainContent = await page.locator('#contentContainer').first();
    const hasContent = await mainContent.count() > 0;
    console.log(`   Main content area: ${hasContent ? '✓' : '❌'}`);
    
    // Check mobile menu (hamburger)
    const mobileToggle = await page.locator('.navbar-toggler').count();
    console.log(`   Mobile menu toggle: ${mobileToggle > 0 ? '✓' : '❌'}`);
    
    // Check progress bar
    const progressBar = await page.locator('#progressBar').count();
    console.log(`   Progress bar: ${progressBar > 0 ? '✓' : '❌'}`);
    
    // Take screenshots
    await page.screenshot({ path: 'test-results/functionality-light.png' });
    
    // If dark mode works, take dark screenshot
    if (hasToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/functionality-dark.png' });
    }
    
    console.log('\n=== END OF FUNCTIONALITY CHECK ===\n');
  });
});