// files.js
import { getCSRFToken } from './utils.js';

class FileManager {
  constructor() {
    this.fileUploadForm = document.getElementById("file-upload-form");
    this.fileInput = document.getElementById("file-input");
    this.fileList = document.getElementById("file-list");
    
    if (this.fileUploadForm && this.fileInput && this.fileList) {
      this.init();
    } else {
      console.warn('File upload elements not found');
    }
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // File upload form submission
    this.fileUploadForm.addEventListener("submit", (event) => this.handleFileUpload(event));
    
    // File deletion buttons
    document.querySelectorAll(".delete-file-btn").forEach(button => {
      button.addEventListener("click", (event) => this.handleFileDeletion(event));
    });
  }

  async handleFileUpload(event) {
    event.preventDefault();
    
    const file = this.fileInput.files[0];
    if (!file) {
      this.showAlert("Please select a file!", "danger");
      return;
    }

    // Validate file size (example: 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showAlert("File size exceeds 10MB limit", "danger");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(this.fileUploadForm.dataset.url, {
        method: "POST",
        headers: { "X-CSRFToken": getCSRFToken() },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.message && data.file_url) {
        this.displayUploadedFile(file, data.file_url);
        this.fileInput.value = "";
        this.showAlert("File uploaded successfully!", "success");
      }
    } catch (error) {
      console.error("Upload error:", error);
      this.showAlert(error.message, "danger");
    }
  }

  displayUploadedFile(file, fileUrl) {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
    
    // File preview container
    const previewContainer = document.createElement("div");
    previewContainer.className = "d-flex align-items-center";
    
    // File icon based on type
    const fileIcon = this.getFileIcon(file.type, fileUrl);
    previewContainer.appendChild(fileIcon);

    // File info
    const fileInfo = document.createElement("div");
    const fileName = document.createElement("a");
    fileName.href = fileUrl;
    fileName.textContent = file.name;
    fileName.className = "text-decoration-none";
    fileName.target = "_blank";
    fileInfo.appendChild(fileName);
    previewContainer.appendChild(fileInfo);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-file-btn btn btn-sm btn-outline-danger";
    deleteBtn.innerHTML = '<span class="material-icons-outlined">delete</span>';
    deleteBtn.dataset.fileId = file.id || Date.now(); // Temporary ID if not available
    deleteBtn.addEventListener("click", (event) => this.handleFileDeletion(event));

    listItem.append(previewContainer, deleteBtn);
    this.fileList.prepend(listItem);
  }

  getFileIcon(fileType, fileUrl) {
    const icon = document.createElement("span");
    icon.className = "material-icons-outlined me-2";
    
    if (fileType.startsWith("image/")) {
      icon.textContent = "image";
      icon.classList.add("text-primary");
      
      // Optional: Create thumbnail
      const img = document.createElement("img");
      img.src = fileUrl;
      img.alt = "Preview";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "4px";
      icon.replaceWith(img);
      return img;
    } else if (fileType.startsWith("video/")) {
      icon.textContent = "videocam";
      icon.classList.add("text-danger");
    } else if (fileType === "application/pdf") {
      icon.textContent = "picture_as_pdf";
      icon.classList.add("text-danger");
    } else if (fileType.includes("spreadsheet")) {
      icon.textContent = "grid_on";
      icon.classList.add("text-success");
    } else if (fileType.includes("document")) {
      icon.textContent = "description";
      icon.classList.add("text-primary");
    } else {
      icon.textContent = "insert_drive_file";
    }
    
    return icon;
  }

  async handleFileDeletion(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const fileId = button.dataset.fileId;
    const listItem = button.closest("li");

    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`/tasks/file/${fileId}/delete/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCSRFToken() }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Deletion failed");
      }

      listItem.remove();
      this.showAlert("File deleted successfully", "success");
    } catch (error) {
      console.error("Deletion error:", error);
      this.showAlert(error.message, "danger");
    }
  }

  showAlert(message, type) {
    // Remove any existing alerts
    const existingAlert = document.querySelector(".file-manager-alert");
    if (existingAlert) {
      existingAlert.remove();
    }

    // Create new alert
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} file-manager-alert alert-dismissible fade show`;
    alert.style.position = "fixed";
    alert.style.bottom = "20px";
    alert.style.right = "20px";
    alert.style.zIndex = "1000";
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
}

// Initialize when imported
export default function initFileManager() {
  return new FileManager();
}