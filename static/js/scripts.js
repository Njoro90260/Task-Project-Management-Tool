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
        toggleTaskDetails();  // Initial check on page load
    }

    // Drag and drop functionality
    const taskCards = document.querySelectorAll('.task-card');
    const taskLists = document.querySelectorAll('.task-list');

    taskCards.forEach(card => {
        card.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("task_id", card.getAttribute("data-task-id"));
        });
    });

    taskLists.forEach(list => {
        list.addEventListener("dragover", (event) => {
            event.preventDefault();
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
                    location.reload();  // Refresh the board to reflect changes
                }
            })
            .catch(error => console.error("Error updating task:", error));
        });
    });
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
