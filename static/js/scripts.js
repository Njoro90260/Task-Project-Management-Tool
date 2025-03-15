document.addEventListener("DOMContentLoaded", function () {
    // comments in the dashboard
    let showMoreButton = document.getElementById("show-more-comments");
    let modal = document.getElementById("comments-modal");
    let closeButton = document.querySelector(".close");

    if (showMoreButton) {
        showMoreButton.addEventListener("click", function () {
            console.log("Show More button clicked!"); // Debugging check
            modal.style.display = "block"; // Show the modal
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", function () {
            modal.style.display = "none"; // Hide the modal
        });
    }

    // Close the modal if the user clicks outside it
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
    // comments in the dashboard

    // toggle sidebar
    const sidebar = document.getElementById("sidebar-wrapper");
    const mainContent = document.getElementById("mainContent");
    const sidebarToggle = document.getElementById("sidebarToggle");

    sidebarToggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-hidden");
    });
    // Elements for comment input and suggestions
    const commentInput = document.getElementById("comment-text");
    const suggestionBox = document.getElementById("mention-suggestions");
    const commentForm = document.getElementById("comment-form");
    const commentList = document.getElementById("comment-list");
    const notifCount = document.getElementById("notif-count");
    const notifList = document.getElementById("notif-items");

    let debounceTimeout;
    let selectedIndex = -1; // For keyboard navigation

    // Get CSRF token from hidden input
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

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

    // Event listener for comment input keyup
    if (commentInput) {
        commentInput.addEventListener("keyup", function (event) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => handleKeyUp(event), 300);
        });
    }

    // Handle keyup event for comment input
    async function handleKeyUp(event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === "Escape") {
            handleKeyNavigation(event);
            return;
        }

        const cursorPosition = commentInput.selectionStart;
        const text = commentInput.value.substring(0, cursorPosition);
        const match = text.match(/@\w+$/);

        if (match) {
            const query = match[0].substring(1);
            if (query.length > 0) {
                try {
                    const response = await fetch(`/users/search_users/?q=${query}`);
                    const data = await response.json();
                    updateSuggestions(data, cursorPosition);
                } catch (error) {
                    console.error("Error fetching user suggestions:", error);
                }
            } else {
                hideSuggestions();
            }
        } else {
            hideSuggestions();
        }
    }

    // Update suggestions for mentions
    function updateSuggestions(users, cursorPosition) {
        suggestionBox.innerHTML = "";
        if (users.length === 0) {
            hideSuggestions();
            return;
        }

        users.forEach((user, index) => {
            const li = document.createElement("li");
            li.textContent = user.username;
            li.setAttribute("data-username", user.username);

            li.addEventListener("click", () => insertMention(user.username, cursorPosition));

            suggestionBox.appendChild(li);
        });

        selectedIndex = -1; // Reset selection
        showSuggestions();
    }

    // Show suggestions box
    function showSuggestions() {
        if (suggestionBox.innerHTML.trim() !== "") {
            suggestionBox.style.display = "block";
        }
    }

    // Hide suggestions box
    function hideSuggestions() {
        suggestionBox.innerHTML = "";
        suggestionBox.style.display = "none";
    }

    // Insert mention into comment input
    function insertMention(username, cursorPosition) {
        const text = commentInput.value;
        const beforeMention = text.substring(0, cursorPosition).replace(/@\w*$/, "@" + username + " ");
        const afterMention = text.substring(cursorPosition);
        commentInput.value = beforeMention + afterMention;
        commentInput.focus();
        hideSuggestions();
    }

    // Handle keyboard navigation in suggestions
    function handleKeyNavigation(event) {
        const items = suggestionBox.getElementsByTagName("li");
        if (!items.length) return;

        if (event.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % items.length;
        } else if (event.key === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        } else if (event.key === "Enter" && selectedIndex >= 0) {
            event.preventDefault();
            items[selectedIndex].click();
        } else if (event.key === "Escape") {
            hideSuggestions();
        }

        // Update selection highlight
        Array.from(items).forEach((item, index) => {
            item.style.background = index === selectedIndex ? "#f0f0f0" : "white";
        });
    }

    // Handle comment form submission
    if (commentForm) {
        commentForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const text = commentInput.value;
            const commentId = commentForm.dataset.commentId; // Assuming commentId is stored in data-comment-id attribute

            try {
                const response = await fetch(`/tasks/${commentId}/add_comment/`, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": getCSRFToken(),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ text: text })
                });
                const data = await response.json();
                if (data.message) {
                    if (commentList) {
                        const newComment = document.createElement("li");
                        newComment.innerHTML = `<strong>${data.user}:</strong> ${data.comment}`;
                        commentList.appendChild(newComment);
                        commentInput.value = "";
                    }

                    fetchNotifications();
                } else {
                    console.error("Error:", data.error);
                }
            } catch (error) {
                console.error("Error submitting comment:", error);
            }
        });
    }

    // Fetch notifications
    function fetchNotifications() {
        fetch("/notifications/")
            .then(response => response.json())
            .then(data => {
                let notificationList = document.getElementById("notificationList");
                let notificationCount = document.getElementById("notificationCount");

                notificationList.innerHTML = "";

                if (data.count > 0) {
                    notificationCount.textContent = data.count;
                    data.notifications.forEach(notif => {
                        let item = document.createElement("a");
                        item.href = notif.url;
                        item.className = "list-group-item list-group-item-action";
                        item.innerHTML =  `
                        <div class="d-flex justify-content-between">
                            <span>${notif.message}</span>
                            <small class="text-muted">${notif.created_at}</small>
                        </div>
                    `;
                        item.addEventListener("click", function (event) {
                            event.preventDefault();
                            markAsRead(notif.id, notif.url);
                        });
                        notificationList.appendChild(item);
                    });
                } else {
                    notificationCount.textContent = "0";
                    notificationList.innerHTML = `<p class="text-muted text-center">No new notifications</p>`;
                }
            })
            .catch(error => console.error("Error fetching notifications:", error));
    }

    function markAsRead(notificationId, redirectUrl) {
        fetch(`/notifications/mark-as-read/${notificationId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "Content-Type": "application/json"
            }
        })
            .then(() => {
                window.location.href = redirectUrl;  // Redirect to notification URL
            })
            .catch(error => console.error("Error marking notification as read:", error));
    }

    const clearNotificationsButton = document.getElementById("clearNotifications");
    if (clearNotificationsButton) {
        clearNotificationsButton.addEventListener("click", function () {
            fetch("/notifications/clear/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Content-Type": "application/json"
                }
            })
                .then(() => fetchNotifications())
                .catch(error => console.error("Error clearing notifications:", error));
        });
    }

    // Initial fetch of notifications and set interval for updates
    fetchNotifications();
    setInterval(fetchNotifications, 10000);

    // Handle file upload form submission
    const fileUploadForm = document.getElementById("file-upload-form");
    if (fileUploadForm) {
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
                    if (data.message && data.file_url) {
                        displayUploadedFile(file, data.file_url);
                        fileInput.value = "";
                    } else {
                        console.error("Upload failed:", data.error);
                    }
                });
        });
    }

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
});