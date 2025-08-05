const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('file:///var/projects/interview_prep/index.html');
  await page.waitForTimeout(2000);
  
  console.log('\n=== CHECKING ANSWER CONTENT ===\n');
  
  // Check first few answers in detail
  for (let i = 1; i <= 3; i++) {
    const questionCard = await page.$(`#q${i}`);
    if (questionCard) {
      // Get question text
      const questionText = await questionCard.$eval('.card-header h3', el => el.textContent);
      console.log(`\n${questionText}`);
      console.log('─'.repeat(50));
      
      // Get answer paragraphs
      const paragraphs = await questionCard.$$eval('.card-body p', elements => 
        elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
      );
      
      // Print first few paragraphs
      for (let j = 0; j < Math.min(3, paragraphs.length); j++) {
        console.log(`Paragraph ${j+1}: ${paragraphs[j]}`);
        if (paragraphs[j].startsWith('"') || paragraphs[j].endsWith('"')) {
          console.log('  ⚠️  THIS PARAGRAPH HAS QUOTES!');
        }
      }
    }
  }
  
  await browser.close();
})();