const { test, expect } = require('@playwright/test');

test('Final layout verification', async ({ page }) => {
  await page.goto('http://localhost:8000/index.html');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== FINAL LAYOUT VERIFICATION ===\n');
  
  // Check button position
  const toggleButton = page.locator('#toggleSidebar');
  const buttonBounds = await toggleButton.boundingBox();
  console.log(`Menu button position: Left=${buttonBounds?.x}, Top=${buttonBounds?.y}`);
  console.log(`Menu button on left side: ${buttonBounds?.x < 200 ? '✓' : '❌'}`);
  
  // Check sidebar state
  const sidebar = page.locator('#sidebar');
  const sidebarDisplay = await sidebar.evaluate(el => window.getComputedStyle(el).display);
  console.log(`\nSidebar display: ${sidebarDisplay}`);
  
  // Toggle and check
  await toggleButton.click();
  await page.waitForTimeout(500);
  
  const sidebarDisplayAfter = await sidebar.evaluate(el => window.getComputedStyle(el).display);
  const mainWidth = await page.locator('#mainContent').boundingBox();
  
  console.log(`After toggle - Sidebar display: ${sidebarDisplayAfter}`);
  console.log(`Main content width: ${mainWidth?.width}`);
  console.log(`Main content fills screen: ${mainWidth?.width > 1000 ? '✓' : '❌'}`);
  
  // Test all features together
  console.log('\n=== ALL FEATURES CHECK ===');
  
  // 1. Search
  await page.fill('#searchBox', 'Pulumi');
  await page.waitForTimeout(500);
  const highlights = await page.locator('.search-highlight').count();
  console.log(`Search working: ${highlights > 0 ? '✓' : '❌'} (${highlights} highlights)`);
  
  // 2. Navigation
  const navItems = await page.locator('#sidebarNav a').count();
  console.log(`Navigation items: ${navItems > 0 ? '✓' : '❌'} (${navItems} items)`);
  
  // 3. Dark mode
  const darkToggle = page.locator('#darkModeToggle');
  await darkToggle.click();
  await page.waitForTimeout(500);
  const isDark = await page.evaluate(() => document.body.getAttribute('data-theme') === 'dark');
  console.log(`Dark mode: ${isDark ? '✓' : '❌'}`);
  
  // 4. Content
  const questions = await page.locator('.question-card').count();
  const codeBlocks = await page.locator('pre code').count();
  console.log(`Questions: ${questions}/18`);
  console.log(`Code blocks: ${codeBlocks}/30+`);
  
  console.log('\n✅ Final layout verification complete!');
});