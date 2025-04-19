// search.js
import { getCSRFToken, debounce } from './utils.js';

class SearchSystem {
    constructor() {
        this.searchForm = document.getElementById("search-form");
        this.searchInput = this.searchForm?.querySelector("input[name='q']");
        this.resultContainer = document.getElementById("results");
        this.apiUrl = "/tasks/api/search/";
        this.resultsPageUrl = "/tasks/search/results/";

        if (this.searchForm && this.searchInput) {
            this.init();
        } else {
            console.warn('Search elements not found');
        }
    }

    init() {
        this.setupEventListeners();
        console.log('Search system initialized');

        if (window.location.pathname === this.resultsPageUrl && this.resultContainer) {
            const query = new URLSearchParams(window.location.search).get('q');
            if (query) this.performSearch(query);
        }
    }

    setupEventListeners() {
        // Form submission
        this.searchForm.addEventListener("submit", (event) => this.handleSearch(event));

        if (this.resultContainer) {
            this.searchInput.addEventListener("input", debounce(() => {
                this.performSearch(this.searchInput.value);
            }, 300));
        }
    }

    async handleSearch(event) {
        event.preventDefault();
        const query = this.searchInput.value.trim();

        if (this.resultContainer) {
            // If we're already on results page, just perform the search
            await this.performSearch(query);

            // Update URL without reloading
            window.history.pushState({}, '', `${this.resultsPageUrl}?q=${encodeURIComponent(query)}`);
        } else {
            // Redirect to results page for initial search
            window.location.href = `${this.resultsPageUrl}?q=${encodeURIComponent(query)}`;
        }
    }


    async performSearch(query) {
        if (!query) {
            this.clearResults();
            return;
        }

        try {
            const url = `${this.apiUrl}?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();
            this.displayResults(data);
        } catch (error) {
            console.error("Search error:", error);
            this.showError("Failed to perform search");
        }
    }

    displayResults(data) {
        this.clearResults();

        if (this.isEmpty(data)) {
            this.resultContainer.innerHTML = "<p class='text-muted'>No results found.</p>";
            return;
        }

        if (data.tasks?.length > 0) {
            this.createResultSection("Tasks", data.tasks, task =>
                `${task.title} - ${task.status} - ${task.priority}`
            );
        }

        if (data.projects?.length > 0) {
            this.createResultSection("Projects", data.projects, project =>
                `${project.name}: ${project.description}`
            );
        }

        if (data.users?.length > 0) {
            this.createResultSection("Users", data.users, user =>
                `${user.username} (${user.email})`
            );
        }
    }

    createResultSection(title, items, formatCallback) {
        const section = document.createElement("div");
        section.className = "search-section mb-4";
        section.innerHTML = `<h3 class="h5">${title}</h3>`;

        const list = document.createElement("div");
        list.className = "list-group";

        items.forEach(item => {
            const element = document.createElement("a");
            element.className = "list-group-item list-group-item-action";
            // Safely generate URL
            const itemUrl = this.getResultUrl(item);
            if (!itemUrl) {
                console.error('Invalid item missing ID:', item);
                return; // Skip this item
            }
            element.href = itemUrl;
            element.textContent = formatCallback(item);
            list.appendChild(element);
        });

        section.appendChild(list);
        this.resultContainer.appendChild(section);
    }

    getResultUrl(item) {
        // First verify the item has an ID
        if (!item.id) {
            console.warn('Item missing ID property:', item);
            return "#";
        }
        if (item.title !== undefined) {
            return `/tasks/${item.id}/`;
        }
        if (item.name !== undefined) {
            return `/project-details/${item.id}/`;
        }
        if (item.username !== undefined) {
            return `/user-profile/${item.id}/`;
        }
        return "#";
    }

    clearResults() {
        if (this.resultContainer) {
            this.resultContainer.innerHTML = "";
        }
    }

    isEmpty(data) {
        return (
            (!data.tasks || data.tasks.length === 0) &&
            (!data.projects || data.projects.length === 0) &&
            (!data.users || data.users.length === 0)
        );
    }

    showError(message) {
        if (this.resultContainer) {
            this.resultContainer.innerHTML = `
        <div class="alert alert-danger">
          ${message}
          <button class="btn btn-sm btn-outline-secondary ms-2" onclick="window.location.reload()">
            Retry
          </button>
        </div>
      `;
        }
    }
}

// Initialize when imported
export default function initSearch() {
    return new SearchSystem();
}