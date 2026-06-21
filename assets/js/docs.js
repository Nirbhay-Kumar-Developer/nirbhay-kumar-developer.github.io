// assets/js/docs.js

export function compileMarkdownToHTML(markdownText) {
    const lines = markdownText.split('\n');
    let htmlOutput = '';
    let inList = false;
    let listType = ''; // 'ul' or 'ol'
    let inTable = false;
    let tableHeaders = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Handle Table closing
        if (inTable && (!line.startsWith('|') || line.includes('---'))) {
            if (line.includes('---')) continue; // skip alignment lines
            htmlOutput += '</tbody></table></div>';
            inTable = false;
        }

        // Handle List closing
        if (inList && !line.startsWith('* ') && !line.startsWith('- ') && !/^\d+\.\s/.test(line)) {
            htmlOutput += `</${listType}>`;
            inList = false;
        }

        // 1. Headers
        if (line.startsWith('# ')) {
            htmlOutput += `<h1>${parseInlineFormatting(line.substring(2))}</h1>`;
        } else if (line.startsWith('## ')) {
            htmlOutput += `<h2>${parseInlineFormatting(line.substring(3))}</h2>`;
        } else if (line.startsWith('### ')) {
            htmlOutput += `<h3>${parseInlineFormatting(line.substring(4))}</h3>`;
        }
        
        // 2. Code Blocks
        else if (line.startsWith('```')) {
            const lang = line.substring(3).trim() || 'text';
            let codeBody = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeBody.push(lines[i]);
                i++;
            }
            const cleanCode = codeBody.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const base64Code = btoa(unescape(encodeURIComponent(codeBody.join('\n'))));
            
            htmlOutput += `
                <div class="markdown-code-block-wrapper">
                    <div class="markdown-code-header">
                        <span class="markdown-code-lang">${lang}</span>
                        <button class="markdown-code-copy-btn" onclick="navigator.clipboard.writeText(decodeURIComponent(escape(atob('${base64Code}')))).then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy Code', 2000); })">Copy Code</button>
                    </div>
                    <pre><code class="language-${lang}">${cleanCode}</code></pre>
                </div>`;
        }

        // 3. Blockquotes
        else if (line.startsWith('>')) {
            htmlOutput += `<blockquote><p>${parseInlineFormatting(line.substring(1).trim())}</p></blockquote>`;
        }

        // 4. Tables
        else if (line.startsWith('|')) {
            const columns = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (!inTable) {
                inTable = true;
                htmlOutput += '<div class="table-responsive-wrapper"><table><thead><tr>';
                columns.forEach(col => htmlOutput += `<th>${parseInlineFormatting(col)}</th>`);
                htmlOutput += '</tr></thead><tbody>';
            } else {
                htmlOutput += '<tr>';
                columns.forEach(col => htmlOutput += `<td>${parseInlineFormatting(col)}</td>`);
                htmlOutput += '</tr>';
            }
        }

        // 5. Unordered Lists
        else if (line.startsWith('* ') || line.startsWith('- ')) {
            if (!inList || listType !== 'ul') {
                if (inList) htmlOutput += `</${listType}>`;
                inList = true;
                listType = 'ul';
                htmlOutput += '<ul>';
            }
            htmlOutput += `<li>${parseInlineFormatting(line.substring(2))}</li>`;
        }

        // 6. Ordered Lists
        else if (/^\d+\.\s/.test(line)) {
            const content = line.replace(/^\d+\.\s/, '');
            if (!inList || listType !== 'ol') {
                if (inList) htmlOutput += `</${listType}>`;
                inList = true;
                listType = 'ol';
                htmlOutput += '<ol>';
            }
            htmlOutput += `<li>${parseInlineFormatting(content)}</li>`;
        }

        // 7. Empty lines
        else if (line === '') {
            continue;
        }

        // 8. Regular Paragraphs
        else {
            htmlOutput += `<p>${parseInlineFormatting(line)}</p>`;
        }
    }

    // Clean up unclosed structures
    if (inTable) htmlOutput += '</tbody></table></div>';
    if (inList) htmlOutput += `</${listType}>`;

    return htmlOutput;
}

function parseInlineFormatting(text) {
    let out = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    return out;
}

export function buildTableOfContentsMenu(targetContainerNode) {
    const trackingHeaders = targetContainerNode.querySelectorAll('h2, h3');
    if(trackingHeaders.length === 0) return document.createElement('div');
    
    const navContainer = document.createElement('div');
    navContainer.className = 'docs-toc-matrix';
    
    let htmlBlueprint = `<p class="docs-toc-header">On This Page</p><ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem;">`;
    trackingHeaders.forEach((header, idx) => {
        const uniqueId = `toc-anchor-${idx}`;
        header.id = uniqueId;
        const subNavIndent = header.tagName.toLowerCase() === 'h3' ? 'padding-left: 1rem; font-size:0.85rem;' : 'font-size: 0.9rem;';
        htmlBlueprint += `<li><a href="#${uniqueId}" style="${subNavIndent} color:var(--text-muted); font-weight:500; display:block;">${header.textContent}</a></li>`;
    });
    htmlBlueprint += `</ul>`;
    navContainer.innerHTML = htmlBlueprint;
    return navContainer;
}