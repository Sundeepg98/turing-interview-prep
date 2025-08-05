// Terminal Simulation Verification Script
// Run this in the browser console to verify the terminal simulation feature

function verifyTerminalSimulation() {
    console.log('=== Terminal Simulation Verification ===');
    
    // 1. Check if terminal styles are present
    const terminalStyles = document.querySelector('style') || document.querySelector('link[rel="stylesheet"]');
    const hasTerminalCSS = terminalStyles && terminalStyles.textContent && terminalStyles.textContent.includes('.terminal');
    console.log('✓ Terminal CSS found:', hasTerminalCSS);
    
    // 2. Check for bash/shell code blocks
    const codeBlocks = document.querySelectorAll('code.language-bash, code.language-shell');
    console.log(`✓ Found ${codeBlocks.length} bash/shell code blocks`);
    
    // 3. Check for pulumi commands
    let pulumiBlocks = 0;
    codeBlocks.forEach((block, index) => {
        if (block.textContent.includes('pulumi')) {
            pulumiBlocks++;
            console.log(`  - Block ${index + 1} contains 'pulumi'`);
        }
    });
    console.log(`✓ Found ${pulumiBlocks} blocks with 'pulumi' commands`);
    
    // 4. Check for terminal elements
    const terminals = document.querySelectorAll('.terminal');
    console.log(`✓ Found ${terminals.length} terminal simulations`);
    
    // 5. Verify terminal structure
    terminals.forEach((terminal, index) => {
        console.log(`\n  Terminal ${index + 1}:`);
        
        // Check header
        const header = terminal.querySelector('.terminal-header');
        console.log(`    - Has header: ${!!header}`);
        
        // Check dots
        const redDot = terminal.querySelector('.terminal-dot.red');
        const yellowDot = terminal.querySelector('.terminal-dot.yellow');
        const greenDot = terminal.querySelector('.terminal-dot.green');
        console.log(`    - Red dot: ${!!redDot}`);
        console.log(`    - Yellow dot: ${!!yellowDot}`);
        console.log(`    - Green dot: ${!!greenDot}`);
        
        // Check content
        const content = terminal.querySelector('.terminal-content');
        console.log(`    - Has content: ${!!content}`);
        
        // Check cursor
        const cursor = terminal.querySelector('.terminal-cursor');
        console.log(`    - Has cursor: ${!!cursor}`);
        
        // Check cursor animation
        if (cursor) {
            const animationName = window.getComputedStyle(cursor).animationName;
            console.log(`    - Cursor animation: ${animationName}`);
        }
        
        // Check styling
        const bgColor = window.getComputedStyle(terminal).backgroundColor;
        console.log(`    - Background color: ${bgColor}`);
    });
    
    // 6. Summary
    console.log('\n=== Summary ===');
    console.log(`Expected terminals (pulumi blocks): ${pulumiBlocks}`);
    console.log(`Actual terminals found: ${terminals.length}`);
    console.log(`Status: ${terminals.length === pulumiBlocks ? '✅ PASS' : '❌ FAIL'}`);
    
    return {
        pulumiBlocks,
        terminalsFound: terminals.length,
        success: terminals.length === pulumiBlocks
    };
}

// Run the verification
verifyTerminalSimulation();