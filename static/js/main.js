// Main entry point that loads modules based on data-page attribute
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const page = body.getAttribute('data-page');
    const globalFeatures = body.getAttribute('data-global').split(' ');

    if (document.getElementById("search-form")) {
        import('./modules/search.js').then(module => {
            module.default();
        });
    }
    // Load global features
    globalFeatures.forEach(feature => {
        switch (feature) {
            case 'search':
                import('./modules/search.js').then(module => {
                    console.log('Search module loaded');
                    module.default();
                }).catch(err => {
                    console.error('Failed to load search:', err);
                });
                break;
            case 'notifications':
                import('./modules/notifications.js').then(module => {
                    console.log('Notifications module loaded');
                    module.default();
                }).catch(err => {
                    console.error('Failed to load notifications:', err);
                });
                break;
            case 'theme':
                // Theme handling if needed
                break;
        }
    });

    // Load page-specific modules
    if (page) {
        switch (page) {
            case 'dashboard':
                import('./modules/comments.js').then(module => {
                    module.default();
                }).catch(err => {
                    console.error('Failed to load comments:', err);
                });
                import('./modules/dashboard.js').then(module => {
                    module.default();
                }).catch(err => {
                    console.error('Failed to load dashboard:', err);
                });
                break;
            case 'task-detail':
                import('./modules/comments.js').then(module => {
                    module.default();
                });
                import('./modules/files.js').then(module => {
                    module.default();
                });
                break;
            case 'kanban':
                import('./modules/kanban.js').then(module => {
                    console.log('Kanban module loaded');
                    module.default();
                }).catch(err => {
                    console.error('Failed to load kanban:', err);
                });
                break;
            case 'balls':
                import('./modules/balls.js').then(module => {
                    console.log('Balls module loaded');
                    module.default(); // Call initBalls
                }).catch(err => {
                    console.error('Failed to load balls:', err);
                });
                break;
            // Add more cases as needed
        }
    }
});