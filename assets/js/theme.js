export function initThemeEngine() {
    const cachedTheme = localStorage.getItem('nk_sys_theme') || 'system';
    applyThemeMode(cachedTheme);

    const themeToggleBtn = document.getElementById('global-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('nk_sys_theme', targetTheme);
            applyThemeMode(targetTheme);
        });
    }

    // React to system OS color preference shifts dynamically
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('nk_sys_theme') === 'system') {
            applyThemeMode('system');
        }
    });
}

export function applyThemeMode(theme) {
    let resolvedTheme = theme;
    if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    const themeIconNode = document.querySelector('#global-theme-toggle span');
    if (themeIconNode) {
        themeIconNode.textContent = resolvedTheme === 'light' ? '☀️' : '🌙';
    }
}