// main.js - Entry point
import { loadGlobalScripts } from "./globalScripts.js";
import { loadPageScripts } from "./pageScripts.js";

document.addEventListener("DOMContentLoaded", function () {
    loadGlobalScripts();
    loadPageScripts();
});
