document.addEventListener('DOMContentLoaded', function () {
    // Handle showing/hiding task details
    const addTaskCheckbox = document.querySelector('input[name="add_task"]');
    const taskDetailsFieldset = document.getElementById('task-details');

    function toggleTaskDetails() {
        if (addTaskCheckbox && taskDetailsFieldset) {
            taskDetailsFieldset.style.display = addTaskCheckbox.checked ? 'block' : 'none';
        }
    }

    if (addTaskCheckbox) {
        addTaskCheckbox.addEventListener('change', toggleTaskDetails);
        toggleTaskDetails(); // Initial check on page load
    }

    // Drag and drop functionality
    const taskCards = document.querySelectorAll('.task-card');
    const taskLists = document.querySelectorAll('.task-list');

    taskCards.forEach(card => {
        card.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("task_id", card.getAttribute("data-task-id"));
            event.dataTransfer.effectAllowed = "move"; // Indicate move operation
        });
    });

    taskLists.forEach(list => {
        list.addEventListener("dragover", (event) => {
            event.preventDefault(); // Allow dropping
        });

        list.addEventListener("drop", (event) => {
            event.preventDefault();
            const taskId = event.dataTransfer.getData("task_id");
            const newStatus = list.closest(".kanban-column").getAttribute("data-status");

            if (!taskId || !newStatus) return;

            fetch("/update-task-status/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({ task_id: taskId, status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    // Move the task to the new column dynamically
                    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
                    if (taskCard) {
                        list.appendChild(taskCard);
                    }
                }
            })
            .catch(error => console.error("Error updating task:", error));
        });
    });

    // Handle form submission without page reload
    const form = document.querySelector(".task-form");

    if (form) { // Ensure form exists before adding event listener
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent full page reload

            const formData = new FormData(form);

            fetch(kanbanUrl, { // Ensure kanbanUrl is set in the template
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: formData,
            })
            .then(response => response.text())
            .then(html => {
                document.body.innerHTML = html; // Reload content dynamically
            })
            .catch(error => console.error("Error:", error));
        });
    }
});

// Function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
