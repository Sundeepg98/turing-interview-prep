const { test, expect } = require('@playwright/test');

test('Test sidebar toggle functionality', async ({ page }) => {
  await page.goto('http://localhost:8000/index.html');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== SIDEBAR TOGGLE TEST ===\n');
  
  // Get initial state
  const sidebar = page.locator('#sidebar');
  const mainContent = page.locator('#mainContent');
  const toggleButton = page.locator('#toggleSidebar');
  
  // Check initial visibility
  const initialSidebarVisible = await sidebar.isVisible();
  const initialMainClasses = await mainContent.getAttribute('class');
  const initialButtonText = await toggleButton.textContent();
  
  console.log('Initial state:');
  console.log(`  Sidebar visible: ${initialSidebarVisible}`);
  console.log(`  Main content classes: ${initialMainClasses}`);
  console.log(`  Button text: "${initialButtonText.trim()}"`);
  
  // Click toggle
  await toggleButton.click();
  await page.waitForTimeout(500);
  
  // Check after first toggle
  const afterFirstToggleSidebarVisible = await sidebar.isVisible();
  const afterFirstToggleMainClasses = await mainContent.getAttribute('class');
  const afterFirstToggleButtonText = await toggleButton.textContent();
  
  console.log('\nAfter first toggle:');
  console.log(`  Sidebar visible: ${afterFirstToggleSidebarVisible}`);
  console.log(`  Main content classes: ${afterFirstToggleMainClasses}`);
  console.log(`  Button text: "${afterFirstToggleButtonText.trim()}"`);
  console.log(`  Main content expanded: ${afterFirstToggleMainClasses.includes('col-md-12') ? '✓' : '❌'}`);
  
  // Click toggle again
  await toggleButton.click();
  await page.waitForTimeout(500);
  
  // Check after second toggle
  const afterSecondToggleSidebarVisible = await sidebar.isVisible();
  const afterSecondToggleMainClasses = await mainContent.getAttribute('class');
  const afterSecondToggleButtonText = await toggleButton.textContent();
  
  console.log('\nAfter second toggle:');
  console.log(`  Sidebar visible: ${afterSecondToggleSidebarVisible}`);
  console.log(`  Main content classes: ${afterSecondToggleMainClasses}`);
  console.log(`  Button text: "${afterSecondToggleButtonText.trim()}"`);
  
  // Take screenshots
  await page.screenshot({ path: 'test-results/sidebar-visible.png' });
  await toggleButton.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/sidebar-hidden.png' });
  
  console.log('\n✓ Screenshots saved');
  console.log('\n=== END OF SIDEBAR TOGGLE TEST ===\n');
});