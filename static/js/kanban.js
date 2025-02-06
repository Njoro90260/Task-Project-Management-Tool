document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".task-card").forEach(task => {
        task.addEventListener("dragstart", function(e) {
            e.dataTransfer.setData("taskId", this.dataset.taskId);
        });
    });

    document.querySelectorAll(".kanban-column").forEach(column => {
        column.addEventListener("dragover", function(e) {
            e.preventDefault();
        });

        column.addEventListener("drop", function(e) {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("taskId");
            const newStatus = this.dataset.status;
            const taskCard = document.querySelector(`[data-task-id='${taskId}']`);

            fetch('update-task-status/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ task_id: taskId, status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    this.querySelector(".task-list").appendChild(taskCard);
                } else {
                    alert("Error: " + data.error);
                }
            })
            .catch(error => console.error("Error:", error));
        });
    });
});

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie) {
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
