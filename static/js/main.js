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
        if (p === "comments") {
            loadScript("/static/js/comment.js");
        } else if (p === "file_upload") {
            loadScript("/static/js/file_upload.js");
        } else if (p === "kanban") {
            loadScript("/static/js/kanban.js");
        } else if (p === "dashboard") {
            loadScript("/static/js/dashboard.js");
        } else {
            console.warn(`No specific script to load for "${p}"`);
        }
    });
});
