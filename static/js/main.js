// Main entry point that loads modules based on data-page attribute
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const page = body.getAttribute('data-page');
    const globalFeatures = body.getAttribute('data-global').split(' ');
    
    // Load global features
    globalFeatures.forEach(feature => {
        switch(feature) {
            case 'search':
                import('./modules/search.js');
                break;
            case 'notifications':
                import('./modules/notifications.js');
                break;
            case 'theme':
                // Theme handling if needed
                break;
        }
    });
    
    // Load page-specific modules
    if (page) {
        switch(page) {
            case 'dashboard':
                import('./modules/balls.js');
                import('./modules/comments.js');
                break;
            case 'task-detail':
                import('./modules/comments.js');
                import('./modules/files.js');
                break;
            // Add more cases as needed
        }
    }
});