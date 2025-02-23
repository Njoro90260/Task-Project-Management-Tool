document.addEventListener("DOMContentLoaded", function () {
    // Elements for comment input and suggestions
    const commentInput = document.getElementById("comment-text");
    const suggestionBox = document.getElementById("mention-suggestions");
    const commentForm = document.getElementById("comment-form");
    const commentList = document.getElementById("comment-list");
    const notifCount = document.getElementById("notif-count");
    const notifList = document.getElementById("notif-items");

    let debounceTimeout;
    let selectedIndex = -1; // For keyboard navigation

    // Event listener for comment input keyup
    commentInput.addEventListener("keyup", function (event) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => handleKeyUp(event), 300);
    });

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

    // Get CSRF token from hidden input
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    // Handle comment form submission
    commentForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const text = commentInput.value;
        const url = commentForm.dataset.url;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: text })
            });
            const data = await response.json();
            if (data.message) {
                const newComment = document.createElement("li");
                newComment.innerHTML = `<strong>${data.user}:</strong> ${data.comment}`;
                commentList.appendChild(newComment);
                commentInput.value = "";

                fetchNotifications();
            } else {
                console.error("Error:", data.error);
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    });

    // Fetch notifications
    async function fetchNotifications() {
        try {
            const response = await fetch("/notifications/");
            const data = await response.json();
            notifList.innerHTML = "";
            notifCount.textContent = data.count;

            data.notifications.forEach(notif => {
                let li = document.createElement("li");
                let a = document.createElement("a");

                a.href = notif.task_url;
                a.textContent = notif.message;
                a.style.textDecoration = "none";
                a.style.color = "blue";

                li.appendChild(a);
                notifList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }

    // Initial fetch of notifications and set interval for updates
    fetchNotifications();
    setInterval(fetchNotifications, 10000);
});

// Handle file upload form submission
document.getElementById("file-upload-form").addEventListener("submit", function(event) {
    event.preventDefault();
    let formData = new FormData();
    let fileInput = document.getElementById("file-input");
    formData.append("file", fileInput.files[0]);

    fetch("{% url 'tasks:upload_task_file' task.id %}", {
        method: "POST",
        headers: { "X-CSRFToken": "{{ csrf_token }}" },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            let newFile = document.createElement("li");
            newFile.innerHTML = `<a href="${URL.createObjectURL(fileInput.files[0])}" download>${fileInput.files[0].name}</a>`;
            document.getElementById("file-list").appendChild(newFile);
            fileInput.value = "";
        } else {
            console.error("Upload failed:", data.error);
        }
    });
});