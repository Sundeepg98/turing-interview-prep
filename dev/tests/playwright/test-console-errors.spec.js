const { test, expect } = require('@playwright/test');

test('Check for JavaScript errors', async ({ page }) => {
  const errors = [];
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  await page.goto('http://localhost:8000/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('\n=== JAVASCRIPT ERRORS CHECK ===\n');
  
  if (errors.length > 0) {
    console.log('❌ Found errors:');
    errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  } else {
    console.log('✓ No JavaScript errors found');
  }
  
  // Try to manually trigger dark mode
  console.log('\n=== MANUAL DARK MODE TEST ===\n');
  
  const result = await page.evaluate(() => {
    const darkModeManager = window.darkModeManager || document.darkModeManager;
    const toggle = document.getElementById('darkModeToggle');
    
    return {
      hasDarkModeManager: !!darkModeManager,
      hasToggle: !!toggle,
      hasSetTheme: typeof window.setTheme === 'function',
      bodyDataTheme: document.body.getAttribute('data-theme')
    };
  });
  
  console.log('Dark mode check:', result);
  
  // Try clicking with JavaScript
  await page.evaluate(() => {
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
      toggle.click();
    }
  });
  
  await page.waitForTimeout(1000);
  
  const afterClick = await page.evaluate(() => {
    return {
      bodyDataTheme: document.body.getAttribute('data-theme'),
      bgColor: window.getComputedStyle(document.body).backgroundColor
    };
  });
  
  console.log('After JS click:', afterClick);
});