import { getCSRFToken } from './utils.js';

export default function initNotifications() {
    const modal = document.getElementById("notificationsModal");
    const openBtn = document.getElementById("openNotifications");
    const closeBtn = document.getElementById("closeNotifications");
    
    if (!modal || !openBtn || !closeBtn) return;

    // Modal handling code
    openBtn.addEventListener("click", function () {
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

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
        .catch(error => {console.error("Error fetching notifications:", error)});
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
    // Initial fetch
    fetchNotifications();
    setInterval(fetchNotifications, 10000);
}

// Initialize when imported
initNotifications();