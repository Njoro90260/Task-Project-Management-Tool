document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");
    const resultContainer = document.getElementById("results");

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!resultContainer) {
            window.location.href = "/tasks/search/?q=" + encodeURIComponent(searchForm.q.value);
            return;
        }

        let formData = new FormData(searchForm);
        let url = `/tasks/api/search/?` + new URLSearchParams(formData).toString();

        fetch(url)
            .then(response => response.json())
            .then(data => {
                resultContainer.innerHTML = "";

                if (data.tasks.length === 0 && data.projects.length === 0 && data.users.length === 0) {
                    resultContainer.innerHTML = "<p>No results found.</p>";
                    return;
                }

                if (data.tasks.length > 0) {
                    let taskSection = document.createElement("div");
                    taskSection.innerHTML = "<h3>Tasks</h3>";
                    data.tasks.forEach(task => {
                        let taskElement = document.createElement("p");
                        taskElement.textContent = `${task.title} - ${task.status} - ${task.priority}`;
                        taskSection.appendChild(taskElement);
                    });
                    resultContainer.appendChild(taskSection);
                }

                if (data.projects.length > 0) {
                    let projectSection = document.createElement("div");
                    projectSection.innerHTML = "<h3>Projects</h3>";
                    data.projects.forEach(proj => {
                        let projectElement = document.createElement("p");
                        projectElement.textContent = `${proj.name}: ${proj.description}`;
                        projectSection.appendChild(projectElement);
                    });
                    resultContainer.appendChild(projectSection);
                }

                if (data.users.length > 0) {
                    let userSection = document.createElement("div");
                    userSection.innerHTML = "<h3>Users</h3>";
                    data.users.forEach(user => {
                        let userElement = document.createElement("p");
                        userElement.textContent = `${user.username} (${user.email})`;
                        userSection.appendChild(userElement);
                    });
                    resultContainer.appendChild(userSection);
                }
            })
            .catch(error => console.error("Error fetching search results:", error));
    });
});