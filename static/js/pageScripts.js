// pageScripts.js - Load page-specific scripts
import { loadScript } from "./scriptLoader.js";

export function loadPageScripts() {
    const page = document.body.getAttribute("data-page") || "";
    const pages = page.split(" ");

    pages.forEach((p) => {
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
            case "dashboard":
                loadScript("/static/js/dashboard.js");
                break;
            default:
                console.warn(`No specific script to load for "${p}"`);
        }
    });
}
