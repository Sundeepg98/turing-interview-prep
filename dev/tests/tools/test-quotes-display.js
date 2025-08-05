const { test, expect } = require('@playwright/test');

test('Check quotes in questions and answers', async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('file:///var/projects/interview_prep/index.html');
  await page.waitForLoadState('networkidle');
  
  // Wait for content to load
  await page.waitForTimeout(2000);
  
  // Check questions
  console.log('\n=== CHECKING QUESTIONS ===');
  const questions = await page.locator('.card-header h3').all();
  for (let i = 0; i < Math.min(5, questions.length); i++) {
    const text = await questions[i].textContent();
    console.log(`Question ${i+1}: "${text}"`);
    console.log(`Has quotes: ${text.includes('"')}`);
  }
  
  // Check answers
  console.log('\n=== CHECKING ANSWERS ===');
  const answerSections = await page.locator('.card-body').all();
  for (let i = 0; i < Math.min(5, answerSections.length); i++) {
    const paragraphs = await answerSections[i].locator('p').all();
    if (paragraphs.length > 0) {
      const firstPara = await paragraphs[0].textContent();
      if (firstPara && firstPara.trim().length > 0) {
        console.log(`\nAnswer ${i+1} first paragraph:`);
        console.log(`"${firstPara.trim()}"`);
        console.log(`Starts with quote: ${firstPara.trim().startsWith('"')}`);
        console.log(`Ends with quote: ${firstPara.trim().endsWith('"')}`);
      }
    }
  }
  
  // Take screenshots
  await page.screenshot({ path: 'full-page.png', fullPage: true });
  
  // Focus on specific question/answer
  const firstQuestion = await page.locator('#q1');
  if (await firstQuestion.count() > 0) {
    await firstQuestion.screenshot({ path: 'q1-screenshot.png' });
    console.log('\nScreenshot of Q1 saved');
  }
  
  await page.close();
});