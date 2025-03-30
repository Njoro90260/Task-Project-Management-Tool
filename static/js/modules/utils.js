// Shared utility functions
export function getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}