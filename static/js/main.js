document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.getAttribute("data-page") || "";
    const globalScripts = document.body.getAttribute("data-global") || "";

    function loadScript(src) {
        const script = document.createElement("script");
        script.src = src;
        document.head.appendChild(script);
    }

    // Load global scripts (search, notifications) if they exist
    if (globalScripts.includes("search")) {
        loadScript("/static/js/search.js");
    }
    if (globalScripts.includes("notifications")) {
        loadScript("/static/js/notifications.js");
    }

    // Handle multiple values in `data-page`
    const pages = page.split(" ");

    pages.forEach(function (p) {
        switch (p) {
            case "comments":
                loadScript("/static/js/comment.js");
                break;
            case "file_upload":
                loadScript("/static/js/file_upload.js");
                break;
            case "kanban":
                loadScript("/static/js/kanban.js");
                break;
            default:
                console.warn(`No specific script to load for "${p}"`);
        }
    });
});
