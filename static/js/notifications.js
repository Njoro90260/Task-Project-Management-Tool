document.addEventListener("DOMContentLoaded", function () {
    const notifCount = document.getElementById("notif-count");
    const notifList = document.getElementById("notif-items");

    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    function fetchNotifications() {
        fetch("/notifications/")
            .then(response => response.json())
            .then(data => {
                notifList.innerHTML = "";
                notifCount.textContent = data.count;

                data.notifications.forEach(notif => {
                    const li = document.createElement("li");
                    li.textContent = notif.message;
                    notifList.appendChild(li);
                });
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
});