// scriptLoader.js - Utility to load scripts dynamically
export function loadScript(src) {
    if (!document.querySelector(`script[src='${src}']`)) { // Prevent duplicate loading
        const script = document.createElement("script");
        script.src = `${src}?v=${new Date().getTime()}`; // Prevent caching issues
        script.async = true;
        document.head.appendChild(script);
    }
}