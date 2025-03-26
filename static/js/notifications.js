document.addEventListener("DOMContentLoaded", function () {

    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    function fetchNotifications() {
        fetch("/notifications/")
            .then(response => response.json())
            .then(data => {
                let notificationList = document.getElementById("notificationList");
                let notificationCount = document.getElementById("notificationCount");

                notifList.innerHTML = "";

                if (data.count > 0) {
                    notificationCount.forEach(notif => {
                        let item = document.createElement("a");
                        item.href = notif.url;
                        item.className = "list-group-item list-group-item-action notification-list-item";
                        item.innerHTML = `
                         <div class="d-flex justify-content-between">
                            <span>${notif.message}</span>
                            <small class="text-muted">${notif.created_at}</small>
                            <hr>
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
});