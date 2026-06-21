import { applyThemeMode } from './theme.js';

let commandPaletteActive = false;
let currentSelectionIdx = 0;

const paletteMenuBlueprint = [
    { label: "Navigate to Home Console", shortcut: "G H", action: () => window.location.href = "index.html" },
    { label: "Navigate to Workspace Analytics", shortcut: "G D", action: () => window.location.href = "dashboard.html" },
    { label: "Navigate to Technical Docs", shortcut: "G O", action: () => window.location.href = "docs.html" },
    { label: "Switch to Dark Mode Layout", shortcut: "T D", action: () => { localStorage.setItem('nk_sys_theme', 'dark'); applyThemeMode('dark'); } },
    { label: "Switch to Light Mode Layout", shortcut: "T L", action: () => { localStorage.setItem('nk_sys_theme', 'light'); applyThemeMode('light'); } }
];

export function bootstrapCommandPalette() {
    buildPaletteDOMStructure();
    hookGlobalKeyboardTriggers();
}

function buildPaletteDOMStructure() {
    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'palette-overlay';
    nodeWrapper.id = 'system-command-palette';
    nodeWrapper.innerHTML = `
        <div class="palette-box">
            <div class="palette-search-container">
                <input type="text" class="palette-input" id="palette-search-field" placeholder="Type a global directive or search navigation routes..." aria-label="System command input console">
            </div>
            <ul class="palette-results-list" id="palette-results-wrapper"></ul>
        </div>
    `;
    document.body.appendChild(nodeWrapper);

    const inputNode = document.getElementById('palette-search-field');
    inputNode.addEventListener('input', (e) => populatePaletteItems(e.target.value));
    
    // Core click dismiss loop
    nodeWrapper.addEventListener('click', (e) => {
        if (e.target === nodeWrapper) dismissPaletteWindow();
    });
}

function hookGlobalKeyboardTriggers() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            togglePaletteVisibility();
        }
        
        if (e.key === 'Escape' && commandPaletteActive) {
            dismissPaletteWindow();
        }

        if (commandPaletteActive) {
            const renderedNodes = document.querySelectorAll('.palette-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                adjustSelectedNodeIndex(1, renderedNodes.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                adjustSelectedNodeIndex(-1, renderedNodes.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (renderedNodes[currentSelectionIdx]) {
                    renderedNodes[currentSelectionIdx].click();
                }
            }
        }
    });

    const contextTriggerBtn = document.getElementById('palette-trigger-btn');
    if (contextTriggerBtn) {
        contextTriggerBtn.addEventListener('click', togglePaletteVisibility);
    }
}

function togglePaletteVisibility() {
    if (commandPaletteActive) dismissPaletteWindow();
    else launchPaletteWindow();
}

function launchPaletteWindow() {
    commandPaletteActive = true;
    currentSelectionIdx = 0;
    const overlayNode = document.getElementById('system-command-palette');
    overlayNode.classList.add('visible-state');
    populatePaletteItems('');
    setTimeout(() => document.getElementById('palette-search-field').focus(), 50);
}

function dismissPaletteWindow() {
    commandPaletteActive = false;
    const overlayNode = document.getElementById('system-command-palette');
    overlayNode.classList.remove('visible-state');
    document.getElementById('palette-search-field').value = '';
}

function populatePaletteItems(filterText) {
    const listWrapper = document.getElementById('palette-results-wrapper');
    listWrapper.innerHTML = '';
    
    const matchedItems = paletteMenuBlueprint.filter(item => 
        item.label.toLowerCase().includes(filterText.toLowerCase())
    );

    if (matchedItems.length === 0) {
        listWrapper.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.95rem;">No internal environment options match your query.</div>`;
        return;
    }

    matchedItems.forEach((item, idx) => {
        const itemLi = document.createElement('li');
        itemLi.className = `palette-item ${idx === currentSelectionIdx ? 'selected-node' : ''}`;
        itemLi.innerHTML = `
            <span>${item.label}</span>
            <span class="palette-shortcut-hint">${item.shortcut}</span>
        `;
        itemLi.addEventListener('click', () => {
            item.action();
            dismissPaletteWindow();
        });
        listWrapper.appendChild(itemLi);
    });
}

function adjustSelectedNodeIndex(direction, boundaries) {
    currentSelectionIdx = (currentSelectionIdx + direction + boundaries) % boundaries;
    const items = document.querySelectorAll('.palette-item');
    items.forEach((item, idx) => {
        if (idx === currentSelectionIdx) {
            item.classList.add('selected-node');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected-node');
        }
    });
}