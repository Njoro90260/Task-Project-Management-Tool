export default function initSearch() {
    const searchForm = document.getElementById("search-form");
    if (!searchForm) return;

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        // ... rest of search handling code
    });
}

// Initialize when imported
initSearch();