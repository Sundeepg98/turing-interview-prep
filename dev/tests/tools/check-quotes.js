const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('file:///var/projects/interview_prep/index.html');
  await page.waitForTimeout(2000);
  
  console.log('\n=== CHECKING WHAT\'S ACTUALLY DISPLAYED ===\n');
  
  // Check questions
  const questionElements = await page.$$('.card-header h3');
  console.log('QUESTIONS:');
  for (let i = 0; i < Math.min(3, questionElements.length); i++) {
    const text = await questionElements[i].textContent();
    console.log(`Q${i+1}: ${text}`);
    console.log(`   Contains quotes? ${text.includes('"') ? 'YES' : 'NO'}\n`);
  }
  
  // Check answers - look for the first paragraph after "Your Answer:"
  console.log('\nANSWERS:');
  const cards = await page.$$('.question-card .card-body');
  
  for (let i = 0; i < Math.min(3, cards.length); i++) {
    // Get all paragraphs in this card
    const paragraphs = await cards[i].$$('p');
    
    // Find the paragraph after "Your Answer:"
    let foundAnswer = false;
    for (const p of paragraphs) {
      const text = await p.textContent();
      if (text.includes('Your Answer:')) {
        // Get the next paragraph
        const nextP = await p.evaluateHandle(el => el.nextElementSibling);
        if (nextP) {
          const answerText = await nextP.evaluate(el => el.textContent);
          console.log(`\nAnswer ${i+1}: ${answerText.substring(0, 60)}...`);
          console.log(`   Starts with quote? ${answerText.trim().startsWith('"') ? 'YES' : 'NO'}`);
          console.log(`   Ends with quote? ${answerText.trim().endsWith('"') ? 'YES' : 'NO'}`);
          foundAnswer = true;
          break;
        }
      }
    }
    
    if (!foundAnswer) {
      // Try to find any paragraph that looks like an answer
      for (const p of paragraphs) {
        const text = await p.textContent();
        if (text.length > 20 && !text.includes('Your Answer:')) {
          console.log(`\nAnswer ${i+1}: ${text.substring(0, 60)}...`);
          console.log(`   Starts with quote? ${text.trim().startsWith('"') ? 'YES' : 'NO'}`);
          console.log(`   Ends with quote? ${text.trim().endsWith('"') ? 'YES' : 'NO'}`);
          break;
        }
      }
    }
  }
  
  await browser.close();
})();