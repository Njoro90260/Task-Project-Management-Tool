import { getCSRFToken } from './utils.js';

export default function initFiles() {
    const fileUploadForm = document.getElementById("file-upload-form");
    if (!fileUploadForm) return;

    fileUploadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let formData = new FormData();
        let fileInput = document.getElementById("file-input");
        let file = fileInput.files[0];

        if (!file) {
            alert("Please select a file!");
            return;
        }

        formData.append("file", file);

        const url = fileUploadForm.dataset.url;

        fetch(url, {
            method: "POST",
            headers: { "X-CSRFToken": getCSRFToken() },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.message && data, file_url) {
                    displayUploadedFile(file, data.file_url);
                    fileInput, value = "";
                } else {
                    console.error("Upload failed:", data.error);
                }
            });
    });

    // Display uploaded file
    function displayUploadedFile(file, fileUrl) {
        let fileList = document.getElementById("file-list");
        let listItem = document.createElement("li");

        if (file.type.startsWith("image/")) {
            let img = document.createElement("img");
            img.src = fileUrl;
            img.alt = file.name;
            img.style.width = "100px";
            img.style.borderRadius = "5px";
            listItem.appendChild(img);
        } else if (file.type.startsWith("video/")) {
            let video = document.createElement("video");
            video.src = fileUrl;
            video.controls = true;
            video.style.width = "150px";
            listItem.appendChild(video);
        } else if (file.type === "application/pdf") {
            let iframe = document.createElement("iframe");
            iframe.src = fileUrl;
            iframe.width = "150px";
            iframe.height = "200px";
            listItem.appendChild(iframe);
        } else {
            let link = document.createElement("a");
            link.href = fileUrl;
            link.textContent = file.name;
            link.target = "_blank";
            listItem.appendChild(link);
        }

        fileList.appendChild(listItem);
    }

    // Handle file deletion
    function deleteFile(fileId, listItem) {
        fetch(`/tasks/file/${fileId}/delete/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": getCSRFToken() }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    listItem.remove();
                } else {
                    alert("Error: " + data.error);
                    console.error("Delete failed:", data.error);
                }
            })
            .catch(error => console.error("Error deleting file:", error));
    }

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-file-btn").forEach(button => {
        button.addEventListener("click", function () {
            let fileId = this.dataset.fileId;
            let listItem = this.closest("li");
            deleteFile(fileId, listItem);
        });
    });
}

// Initialize when imported
initFiles();