import { getCSRFToken } from './utils.js';

class KanbanManager {
  constructor() {
    this.apiURL = "/api/tasks/";
    this.csrfToken = getCSRFToken();
    this.kanbanColumns = document.querySelectorAll(".kanban-column");
    this.taskCards = document.querySelectorAll(".task-card");
    
    if (this.kanbanColumns.length && this.taskCards.length) {
      this.init();
    } else {
      console.warn('Kanban elements not found');
    }
  }

  init() {
    this.setupDragAndDrop();
    console.log('Kanban system initialized');
  }

  setupDragAndDrop() {
    // Add drag events to task cards
    this.taskCards.forEach(task => {
      task.addEventListener("dragstart", this.dragStart.bind(this));
      task.setAttribute('draggable', 'true');
    });

    // Enable dropping on columns
    this.kanbanColumns.forEach(column => {
      column.addEventListener("dragover", this.dragOver.bind(this));
      column.addEventListener("drop", this.dropTask.bind(this));
    });
  }

  dragStart(event) {
    event.dataTransfer.setData("taskId", event.currentTarget.dataset.taskId);
    event.currentTarget.classList.add("dragging");
  }

  dragOver(event) {
    event.preventDefault(); // Necessary to allow drop
  }

  async dropTask(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const newStatus = event.currentTarget.dataset.status;
    const taskElement = document.querySelector(`[data-task-id='${taskId}']`);

    // Visual update first for better UX
    const taskList = event.currentTarget.querySelector(".task-list");
    taskList.appendChild(taskElement);
    taskElement.classList.remove("dragging");

    try {
      await this.updateTaskStatus(taskId, newStatus);
      this.showAlert(`Task moved to ${newStatus}`, 'success');
    } catch (error) {
      console.error("Error updating task:", error);
      this.showAlert("Failed to update task!", 'danger');
      // Optional: Revert visual change if update fails
    }
  }

  async updateTaskStatus(taskId, newStatus) {
    const response = await fetch(`${this.apiURL}${taskId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  }

  showAlert(message, type) {
    // Remove existing alerts if any
    const existingAlert = document.querySelector('.kanban-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    // Create and show new alert
    const alert = document.createElement('div');
    alert.className = `kanban-alert alert alert-${type} alert-dismissible fade show`;
    alert.style.position = 'fixed';
    alert.style.bottom = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '1000';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => alert.remove(), 3000);
  }
}

// Initialize when imported
export default function initKanban() {
  return new KanbanManager();
}