// globalScripts.js - Load globally required scripts
import { loadScript } from "./scriptLoader.js";

export function loadGlobalScripts() {
    loadScript("/static/js/search.js");
    loadScript("/static/js/notifications.js");
    loadScript("/static/js/theme.js");
}

