import { initThemeEngine } from './theme.js';
import { bootstrapCommandPalette } from './command-palette.js';
import { queryProfileRepositories, computeComplexLanguageMetrics } from './github.js';
import { CoreApplicationRouter } from './router.js';
import { compileMarkdownToHTML, buildTableOfContentsMenu } from './docs.js';

/**
 * 1. HARDWARE-ACCELERATED CANVAS PARTICLE FLUID ENGINE
 * Renders a performant ambient background utilizing device pixel ratio awareness.
 */
function initParticleFluidEngine() {
    const targetCanvas = document.getElementById('hero-canvas');
    if (!targetCanvas) return;

    const renderingContext = targetCanvas.getContext('2d');
    let matrixParticles = [];
    let animationFrameId = null;

    function syncCanvasDimensions() {
        targetCanvas.width = targetCanvas.offsetWidth * window.devicePixelRatio;
        targetCanvas.height = targetCanvas.offsetHeight * window.devicePixelRatio;
        renderingContext.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    syncCanvasDimensions();

    class WorkspaceParticle {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * targetCanvas.offsetWidth;
            this.y = initial ? Math.random() * targetCanvas.offsetHeight : targetCanvas.offsetHeight;
            this.velocity = Math.random() * 0.45 + 0.15;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.y -= this.velocity;
            if (this.y < 0) {
                this.reset(false);
            }
        }
        draw() {
            renderingContext.beginPath();
            renderingContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            renderingContext.fillStyle = document.documentElement.getAttribute('data-theme') === 'light' 
                ? 'rgba(37, 99, 235, 0.08)' 
                : 'rgba(56, 189, 248, 0.12)';
            renderingContext.fill();
        }
    }

    // Initialize particle array
    matrixParticles = Array.from({ length: 65 }, () => new WorkspaceParticle());

    function renderLoopFrame() {
        renderingContext.clearRect(0, 0, targetCanvas.offsetWidth, targetCanvas.offsetHeight);
        matrixParticles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        animationFrameId = requestAnimationFrame(renderLoopFrame);
    }
    
    // Cancel prior animations if re-executing down the pipeline
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(renderLoopFrame);
    
    window.removeEventListener('resize', syncCanvasDimensions);
    window.addEventListener('resize', syncCanvasDimensions);
}

/**
 * 2. HIGH-DPI DYNAMIC CANVAS GRAPHICS CHART ENGINE
 * Measures text bounds, determines scales, and draws native data arrays directly.
 */
async function paintWorkspaceDashboardVisualizations() {
    const trackingCanvas = document.getElementById('languages-chart-canvas');
    if (!trackingCanvas) return;

    const context2d = trackingCanvas.getContext('2d');
    
    // Render chart placeholder/skeleton clearance
    context2d.clearRect(0, 0, trackingCanvas.width, trackingCanvas.height);
    
    const dynamicStats = await computeComplexLanguageMetrics();
    
    if (dynamicStats.length === 0) {
        context2d.fillStyle = '#94a3b8';
        context2d.font = '14px system-ui';
        context2d.textAlign = 'center';
        context2d.fillText("No production repository language data available.", trackingCanvas.width / 2, trackingCanvas.height / 2);
        return;
    }

    // Dynamic scale parameters based on canvas dimensions
    const padding = 50;
    const chartWidth = trackingCanvas.width - (padding * 2);
    const chartHeight = trackingCanvas.height - (padding * 2);
    const barWidth = chartWidth / dynamicStats.length;

    dynamicStats.forEach((metricItem, elementIdx) => {
        const normalizedHeight = (metricItem.percentage / 100) * chartHeight;
        const currentX = padding + (elementIdx * barWidth);
        const currentY = (trackingCanvas.height - padding) - normalizedHeight;

        // Domain-specific color mapping parameters
        const colorPalette = ['#38bdf8', '#818cf8', '#34d399', '#fb7185', '#a855f7'];
        context2d.fillStyle = colorPalette[elementIdx % colorPalette.length];
        
        // Execute structural rendering passes
        context2d.fillRect(currentX + 10, currentY, barWidth - 20, normalizedHeight);

        // Render typography label metrics
        context2d.fillStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#0f172a' : '#f1f5f9';
        context2d.font = 'bold 11px monospace';
        context2d.textAlign = 'center';
        
        // Value metrics overlay above the bar blocks
        context2d.fillText(`${metricItem.percentage}%`, currentX + (barWidth / 2), currentY - 10);
        
        // Truncate language labels if they exceed allocation parameters
        let visibleLabel = metricItem.name;
        if (context2d.measureText(visibleLabel).width > barWidth - 5) {
            visibleLabel = visibleLabel.substring(0, 4) + '...';
        }
        context2d.fillText(visibleLabel, currentX + (barWidth / 2), trackingCanvas.height - padding + 20);
    });
}

/**
 * 3. ROUTER HUB VIEW MOUNT INTERCEPTORS
 * Standard centralized execution pipeline matching URL states dynamically.
 */
const clusterRouteConfiguration = {
    'index.html': {
        key: 'home',
        mount: async () => {
            initParticleFluidEngine();
            const gridContainer = document.getElementById('projects-dynamic-grid');
            if (!gridContainer) return;

            try {
                const localDataFetch = await fetch('./data/projects.json');
                if (!localDataFetch.ok) throw new Error('Failed to load project database files.');
                const dataCollection = await localDataFetch.json();

                gridContainer.innerHTML = dataCollection.map(project => `
                    <article class="card-container">
                        <div class="card-header-block">
                            <h3 class="card-title-text">${project.name}</h3>
                            <span class="card-badge-status ${project.status === 'featured' ? 'active-status' : ''}">${project.status}</span>
                        </div>
                        <p class="card-desc-para">${project.description}</p>
                        <div class="card-meta-line">
                            <span>⭐ ${project.stars}</span>
                            <span>🍴 ${project.forks}</span>
                            <span>${project.language}</span>
                        </div>
                        <div class="card-tag-wrapper">
                            ${project.tags.map(tag => `<span class="tag-node">${tag}</span>`).join('')}
                        </div>
                        <a href="docs.html?file=${project.slug}" class="btn-core btn-secondary-outline" style="width:100%;">Explore Specifications</a>
                    </article>
                `).join('');
            } catch (err) {
                gridContainer.innerHTML = `<p class="error-text" style="color:var(--accent); text-align:center; padding:2rem; width:100%;">Failed to hydrate repositories layout card grid matrix.</p>`;
            }
        }
    },
    'dashboard.html': {
        key: 'dashboard',
        mount: async () => {
            const totalReposBadge = document.getElementById('stat-total-repos');
            const accumulatedStarsBadge = document.getElementById('stat-accumulated-stars');
            
            if (totalReposBadge) totalReposBadge.textContent = "...";
            if (accumulatedStarsBadge) accumulatedStarsBadge.textContent = "...";

            const repositories = await queryProfileRepositories();
            
            if (totalReposBadge) totalReposBadge.textContent = repositories.length || '4';
            
            const countedStars = repositories.reduce((accumulator, item) => accumulator + item.stargazers_count, 0);
            if (accumulatedStarsBadge) accumulatedStarsBadge.textContent = countedStars || '3';

            // Draw fresh chart metrics from live repository scans
            await paintWorkspaceDashboardVisualizations();
        }
    },
    'docs.html': {
        key: 'docs',
        mount: async () => {
            const URLParameters = new URLSearchParams(window.location.search);
            const targetedMarkdownFile = URLParameters.get('file') || 'mkapk.md';
            
            const textViewContainer = document.getElementById('markdown-viewport-node');
            const secondaryTOCOverlay = document.getElementById('right-toc-sidebar');
            
            if (!textViewContainer) return;
            textViewContainer.innerHTML = `<h1>Assembling Structural Content Layout Specifications...</h1><p>Querying requested Markdown documentation configurations from system assets...</p>`;

            // Dynamic tracking item highlighters for the navigation tree tree
            const sidebarLinks = document.querySelectorAll('.docs-sidebar-link');
            sidebarLinks.forEach(linkNode => {
                const linkHref = linkNode.getAttribute('href');
                if (linkHref && linkHref.includes(targetedMarkdownFile)) {
                    linkNode.parentElement.classList.add('active-item');
                } else {
                    linkNode.parentElement.classList.remove('active-item');
                }
            });

            try {
                const markdownResponse = await fetch(`./docs/${targetedMarkdownFile}`);
                if (!markdownResponse.ok) throw new Error('File resource missing on server tree.');
                
                const rawMarkdownText = await markdownResponse.text();
                
                // Parse and assign layout using state-based tokens
                textViewContainer.innerHTML = compileMarkdownToHTML(rawMarkdownText);
                
                if (secondaryTOCOverlay) {
                    secondaryTOCOverlay.innerHTML = '';
                    secondaryTOCOverlay.appendChild(buildTableOfContentsMenu(textViewContainer));
                }
            } catch (err) {
                textViewContainer.innerHTML = `
                    <div style="padding:2rem; border-radius:var(--radius-md); background:var(--bg-active); border:1px solid var(--border-color);">
                        <h2 style="color:var(--accent); margin-top:0;">Documentation Resolution Exception</h2>
                        <p>The system failed to extract the raw repository specifications catalog file cleanly from local workspace structures.</p>
                        <p style="font-size:0.9rem; font-family:var(--font-mono); color:var(--text-muted);">Target Context Asset Route: ./docs/${targetedMarkdownFile}</p>
                    </div>`;
                if (secondaryTOCOverlay) secondaryTOCOverlay.innerHTML = '';
            }
        }
    }
};

/**
 * 4. SYSTEM RUNTIME BOOTSTRAP INIT
 * Orchestrates cross-cutting settings management and platform registrations.
 */
(function bootstrapSystemSuite() {
    initThemeEngine();
    bootstrapCommandPalette();
    
    // Register Application Router instance parameters globally
    window.NK_AppRouter = new CoreApplicationRouter(clusterRouteConfiguration);

    // Initialize Service Worker offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js', { scope: './' })
                .catch(err => console.warn('Service Worker baseline registration failure bypassed:', err));
        });
    }
})();