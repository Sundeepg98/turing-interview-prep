// Add copy buttons to all code blocks
document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentElement;
        pre.style.position = 'relative';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-sm btn-outline-secondary copy-code';
        copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '8px';
        copyBtn.style.right = '8px';
        
        copyBtn.addEventListener('click', async () => {
            const code = codeBlock.textContent;
            await navigator.clipboard.writeText(code);
            copyBtn.innerHTML = '<i class="bi bi-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
            }, 2000);
        });
        
        pre.appendChild(copyBtn);
    });
});