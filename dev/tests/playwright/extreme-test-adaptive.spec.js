const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

// Read the markdown file
const MARKDOWN_PATH = '/var/projects/interview_prep/src/markdown/COMPLETE_TURING_INTERVIEW_GUIDE.md';
const HTML_PATH = 'file:///var/projects/interview_prep/index.html';

test.describe('Adaptive Content Analysis', () => {
  let markdownContent;
  let markdownLines;

  test.beforeAll(async () => {
    markdownContent = await fs.readFile(MARKDOWN_PATH, 'utf-8');
    markdownLines = markdownContent.split('\n');
  });

  test('Analyze actual HTML structure and content', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('networkidle');

    console.log('\n=== ACTUAL HTML CONTENT ANALYSIS ===\n');

    // Get all text content
    const allText = await page.locator('body').textContent();
    console.log(`Total text length in HTML: ${allText.length} characters`);
    console.log(`Total markdown length: ${markdownContent.length} characters`);
    console.log(`Content ratio: ${((allText.length / markdownContent.length) * 100).toFixed(1)}%\n`);

    // Analyze what questions ARE present
    const possibleQuestionSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '[class*="question"]',
      '[class*="title"]',
      'strong',
      'b'
    ];

    console.log('Searching for technical questions in various elements...');
    for (const selector of possibleQuestionSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`\nFound ${elements.length} ${selector} elements`);
      
      if (elements.length > 0 && elements.length < 50) {
        console.log('Sample content:');
        for (let i = 0; i < Math.min(5, elements.length); i++) {
          const text = await elements[i].textContent();
          if (text && text.trim().length > 10) {
            console.log(`  - ${text.trim().substring(0, 80)}...`);
          }
        }
      }
    }

    // Find how technical questions are actually formatted
    const questionPatterns = [
      'Q1:', 'Q2:', 'Q3:', // Numbered format
      'Question 1', 'Question 2', // Alternative format
      'manage different environments', // Partial text
      'handle secrets', // Key phrases
      'testing strategy'
    ];

    console.log('\n\nSearching for question patterns...');
    for (const pattern of questionPatterns) {
      const count = await page.locator(`*:has-text("${pattern}")`).count();
      if (count > 0) {
        console.log(`✓ Found pattern "${pattern}" - ${count} times`);
        const first = await page.locator(`*:has-text("${pattern}")`).first();
        const tagName = await first.evaluate(el => el.tagName);
        const className = await first.evaluate(el => el.className);
        console.log(`  Element: <${tagName}${className ? ` class="${className}"` : ''}>`);
      }
    }

    // Analyze code blocks
    console.log('\n\nCode Block Analysis:');
    const codeSelectors = ['pre code', 'pre', 'code', '[class*="code"]', '[class*="highlight"]'];
    
    for (const selector of codeSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`${selector}: ${count} elements`);
        const first = await page.locator(selector).first();
        const sample = await first.textContent();
        console.log(`  Sample: ${sample.substring(0, 60)}...`);
      }
    }

    // Find STAR stories format
    console.log('\n\nSTAR Stories Search:');
    const starPatterns = ['Mailmodo', 'Invecno', 'Situation:', 'Task:', 'Action:', 'Result:'];
    
    for (const pattern of starPatterns) {
      const elements = await page.locator(`*:has-text("${pattern}")`).all();
      if (elements.length > 0) {
        console.log(`✓ Found "${pattern}" in ${elements.length} locations`);
      }
    }

    // Extract actual structure
    console.log('\n\nDocument Structure:');
    const structure = await page.evaluate(() => {
      const walk = (node, level = 0) => {
        const result = [];
        const headings = node.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(h => {
          result.push({
            level: parseInt(h.tagName[1]),
            text: h.textContent.trim(),
            tag: h.tagName
          });
        });
        return result;
      };
      return walk(document.body);
    });

    console.log('Heading hierarchy:');
    structure.forEach(h => {
      console.log(`${'  '.repeat(h.level - 1)}${h.tag}: ${h.text.substring(0, 60)}`);
    });

    // Check for specific markdown conversion issues
    console.log('\n\nMarkdown Conversion Check:');
    
    // Check if markdown syntax is showing raw
    const rawMarkdownPatterns = ['```', '**', '###', '- [ ]', '---'];
    for (const pattern of rawMarkdownPatterns) {
      const found = allText.includes(pattern);
      if (found) {
        console.log(`⚠️  Raw markdown syntax found: "${pattern}"`);
      }
    }

    // Content completeness by searching for unique strings
    console.log('\n\nContent Completeness Check:');
    const uniqueStrings = [
      'Complete Turing Interview Guide',
      'Infrastructure as Code using real programming languages',
      'TypeScript\'s type safety prevented a production outage',
      'I built a GitOps workflow',
      'Component Resources (Your Specialty)',
      'RED FLAGS TO AVOID'
    ];

    let foundCount = 0;
    for (const str of uniqueStrings) {
      const found = allText.includes(str);
      console.log(`${found ? '✓' : '✗'} "${str}"`);
      if (found) foundCount++;
    }
    console.log(`\nContent completeness: ${((foundCount / uniqueStrings.length) * 100).toFixed(0)}%`);
  });

  test('Interactive content exploration', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('networkidle');

    console.log('\n=== INTERACTIVE CONTENT EXPLORATION ===\n');

    // Check for any JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Try different ways to find content
    const searchStrategies = [
      // Strategy 1: Look in main content area
      async () => {
        const main = await page.locator('main, [role="main"], #main, .main, article').first();
        if (await main.count() > 0) {
          const text = await main.textContent();
          console.log(`Main content area found: ${text.length} characters`);
          return text;
        }
        return null;
      },

      // Strategy 2: Look for markdown-specific containers
      async () => {
        const mdContainer = await page.locator('[class*="markdown"], [class*="md-content"], .content').first();
        if (await mdContainer.count() > 0) {
          const text = await mdContainer.textContent();
          console.log(`Markdown container found: ${text.length} characters`);
          return text;
        }
        return null;
      },

      // Strategy 3: Get all divs with substantial content
      async () => {
        const divs = await page.locator('div').all();
        for (const div of divs) {
          const text = await div.textContent();
          if (text.length > 10000) {
            console.log(`Found large content div: ${text.length} characters`);
            return text;
          }
        }
        return null;
      }
    ];

    let mainContent = null;
    for (const strategy of searchStrategies) {
      mainContent = await strategy();
      if (mainContent) break;
    }

    if (mainContent) {
      // Analyze the main content
      console.log('\nMain content analysis:');
      console.log(`- Contains "Pulumi": ${mainContent.includes('Pulumi')}`);
      console.log(`- Contains "TypeScript": ${mainContent.includes('TypeScript')}`);
      console.log(`- Contains "Q1:": ${mainContent.includes('Q1:')}`);
      console.log(`- Contains "STAR": ${mainContent.includes('STAR')}`);
      
      // Count code snippets
      const codeMatches = mainContent.match(/```[\s\S]*?```/g) || [];
      console.log(`- Code blocks found: ${codeMatches.length}`);
    }

    // Check if content is hidden or requires interaction
    console.log('\n\nChecking for hidden or dynamic content...');
    
    // Look for tabs, accordions, or collapsible sections
    const interactiveSelectors = [
      '[class*="tab"]',
      '[class*="accordion"]',
      '[class*="collapse"]',
      '[class*="expand"]',
      'details',
      'summary'
    ];

    for (const selector of interactiveSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found ${count} ${selector} elements - content might be hidden`);
      }
    }

    // Report any JavaScript errors
    if (errors.length > 0) {
      console.log('\n⚠️  JavaScript errors detected:');
      errors.forEach(err => console.log(`  - ${err}`));
    }
  });

  test('Generate improvement recommendations', async ({ page }) => {
    await page.goto(HTML_PATH);
    await page.waitForLoadState('networkidle');

    console.log('\n=== DETAILED IMPROVEMENT RECOMMENDATIONS ===\n');

    const allText = await page.locator('body').textContent();

    // Based on findings, generate specific recommendations
    const recommendations = [];

    // Check content ratio
    const contentRatio = allText.length / markdownContent.length;
    if (contentRatio < 0.8) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Significant content loss',
        detail: `Only ${(contentRatio * 100).toFixed(0)}% of markdown content is rendered`,
        solution: 'Check markdown parser configuration and build process for truncation'
      });
    }

    // Check for code blocks
    const codeBlocks = await page.locator('pre code').count();
    if (codeBlocks < 20) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Missing code blocks',
        detail: `Only ${codeBlocks} code blocks found (expected 26+)`,
        solution: 'Verify code block parsing in markdown processor, check for syntax highlighting library'
      });
    }

    // Check for copy buttons
    const copyButtons = await page.locator('button:has-text("Copy")').count();
    if (copyButtons === 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'No copy functionality for code blocks',
        detail: 'Users cannot easily copy code examples',
        solution: 'Implement copy-to-clipboard functionality for all code blocks'
      });
    }

    // Check for navigation
    const toc = await page.locator('[class*="toc"], [class*="table-of-contents"], nav').count();
    if (toc === 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'No table of contents or navigation',
        detail: 'Users cannot quickly navigate the long document',
        solution: 'Add a sticky table of contents or navigation sidebar'
      });
    }

    // Check for search highlighting
    const searchInput = await page.locator('input[type="search"]').count();
    if (searchInput > 0) {
      const highlightElements = await page.locator('mark, .highlight').count();
      if (highlightElements === 0) {
        recommendations.push({
          priority: 'LOW',
          issue: 'Search results not highlighted',
          detail: 'Search works but results are not visually highlighted',
          solution: 'Add highlighting for search results using <mark> tags or CSS'
        });
      }
    }

    // Check responsive design
    const viewport = page.viewportSize();
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.waitForTimeout(500);
    const mobileOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    await page.setViewportSize(viewport); // Restore

    if (mobileOverflow) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Content overflows on mobile',
        detail: 'Horizontal scrolling required on mobile devices',
        solution: 'Add responsive CSS for code blocks and tables'
      });
    }

    // Output recommendations
    console.log('Based on the analysis, here are the prioritized recommendations:\n');
    
    const priorities = ['HIGH', 'MEDIUM', 'LOW'];
    for (const priority of priorities) {
      const priorityRecs = recommendations.filter(r => r.priority === priority);
      if (priorityRecs.length > 0) {
        console.log(`${priority} PRIORITY:`);
        priorityRecs.forEach((rec, index) => {
          console.log(`\n${index + 1}. ${rec.issue}`);
          console.log(`   Problem: ${rec.detail}`);
          console.log(`   Solution: ${rec.solution}`);
        });
        console.log('');
      }
    }

    // Technical implementation suggestions
    console.log('\nTECHNICAL IMPLEMENTATION GUIDE:\n');
    console.log('1. Markdown Processing Fix:');
    console.log('   - Check if using marked, markdown-it, or remark');
    console.log('   - Enable all necessary plugins (tables, code highlighting, etc.)');
    console.log('   - Verify no content length limits in build process\n');

    console.log('2. Code Block Enhancement:');
    console.log('   - Use Prism.js or highlight.js for syntax highlighting');
    console.log('   - Add copy button component to each pre > code element');
    console.log('   - Ensure language detection from markdown fence notation\n');

    console.log('3. Navigation Implementation:');
    console.log('   - Generate TOC from h2/h3 headings');
    console.log('   - Add smooth scrolling and active section highlighting');
    console.log('   - Consider sticky positioning for desktop view\n');

    console.log('4. Search Enhancement:');
    console.log('   - Implement proper text highlighting on search');
    console.log('   - Add search result count and navigation');
    console.log('   - Consider fuzzy search for better matches\n');

    // Save detailed findings
    const findings = {
      contentRatio: (contentRatio * 100).toFixed(1),
      codeBlocks: codeBlocks,
      copyButtons: copyButtons,
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(
      '/var/projects/interview_prep/extreme-test-findings.json',
      JSON.stringify(findings, null, 2)
    );
    console.log('Detailed findings saved to extreme-test-findings.json');
  });
});