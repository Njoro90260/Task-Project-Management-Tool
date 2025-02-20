document.addEventListener("DOMContentLoaded", function () {
    // CSRF Token Retrieval Function
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    // Comment Submission
    document.getElementById("comment-form").addEventListener("submit", function(event) {
        event.preventDefault();
        let text = document.getElementById("comment-text").value;
        let url = document.getElementById("comment-form").dataset.url; // Get URL from data attribute

        fetch(url, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                let newComment = document.createElement("li");
                newComment.innerHTML = `<strong>${data.user}:</strong> ${data.comment}`;
                document.getElementById("comment-list").appendChild(newComment);
                document.getElementById("comment-text").value = "";

                // Fetch notifications only when a new comment is added
                fetchNotifications();
            } else {
                console.error("Error:", data.error);
            }
        })
        .catch(error => console.error("Error:", error));
    });

    // Fetch Notifications
    function fetchNotifications() {
        fetch("/notifications/")
            .then(response => response.json())
            .then(data => {
                let notifCount = document.getElementById("notif-count");
                let notifList = document.getElementById("notif-items");

                notifList.innerHTML = "";
                notifCount.textContent = data.count;

                data.notifications.forEach(notif => {
                    let li = document.createElement("li");
                    li.textContent = notif.message;
                    notifList.appendChild(li);
                });
            })
            .catch(error => console.error("Error fetching notifications:", error));
    }

    // Initial Fetch & Auto Refresh Every 10 Seconds
    fetchNotifications();
    setInterval(fetchNotifications, 10000);
});
