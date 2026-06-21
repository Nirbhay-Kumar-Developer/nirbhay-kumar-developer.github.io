// Premium Zero-Dependency Custom Document View Engine Router Integration
export class CoreApplicationRouter {
    constructor(routeConfigBlueprint) {
        this.routes = routeConfigBlueprint;
        this.bootstrapRoutingListeners();
    }

    bootstrapRoutingListeners() {
        // Intercept standard popstate events natively
        window.addEventListener('popstate', () => this.evaluateRouteResolution());
        
        document.addEventListener('click', (e) => {
            const contextualAnchor = e.target.closest('a[data-link]');
            if (contextualAnchor) {
                e.preventDefault();
                const destinationUrl = contextualAnchor.getAttribute('href');
                this.navigate(destinationUrl);
            }
        });

        // First paint verification initialization
        document.addEventListener('DOMContentLoaded', () => this.evaluateRouteResolution());
    }

    navigate(url) {
        window.history.pushState(null, null, url);
        this.evaluateRouteResolution();
    }

    async evaluateRouteResolution() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetRoute = this.routes[currentPath] || this.routes['index.html'];

        updateNavbarActiveIndicators(targetRoute.key);
        
        if (targetRoute && targetRoute.mount) {
            try {
                await targetRoute.mount();
            } catch (err) {
                console.error(`Route Mount Exception on path execution allocation:`, err);
            }
        }
    }
}

function updateNavbarActiveIndicators(activeKey) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(linkNode => {
        if (linkNode.getAttribute('data-link') === activeKey) {
            linkNode.classList.add('active');
        } else {
            linkNode.classList.remove('active');
        }
    });
}