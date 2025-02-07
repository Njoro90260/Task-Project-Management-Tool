document.addEventListener("DOMContentLoaded", function () {
    const apiURL = "/api/tasks/";  // Ensure this matches your API path
    const csrfToken = document.querySelector("input[name='csrfmiddlewaretoken']").value;

    // Add drag events to task cards
    document.querySelectorAll(".task-card").forEach(task => {
        task.addEventListener("dragstart", dragStart);
    });

    // Enable dropping on columns
    document.querySelectorAll(".kanban-column").forEach(column => {
        column.addEventListener("dragover", event => event.preventDefault());  // Allow drop
        column.addEventListener("drop", dropTask);
    });

    function dragStart(event) {
        event.dataTransfer.setData("taskId", event.target.dataset.taskId);
        event.target.classList.add("dragging");  // Optional: Add a class for styling
    }

    function dropTask(event) {
        event.preventDefault();  // Important: Allow the drop action
        const taskId = event.dataTransfer.getData("taskId");
        const newStatus = event.currentTarget.dataset.status;  // Get new column's status

        const taskElement = document.querySelector(`[data-task-id='${taskId}']`);
        event.currentTarget.querySelector(".task-list").appendChild(taskElement);

        // Remove dragging class (optional)
        taskElement.classList.remove("dragging");

        // 🔥 **Now update the database**
        updateTaskStatus(taskId, newStatus);
    }

    function updateTaskStatus(taskId, newStatus) {
        fetch(`${apiURL}${taskId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update task status");
            }
            return response.json();
        })
        .then(data => console.log("Task updated:", data))
        .catch(error => {
            console.error("Error updating task:", error);
            alert("Failed to update task!");  // Alert user if update fails
        });
    }
});
