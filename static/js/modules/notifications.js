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

    // Notification fetching and handling code
    // (fetchNotifications, markAsRead, clearNotifications, etc.)
    
    // Initial fetch
    fetchNotifications();
    setInterval(fetchNotifications, 10000);
}

// Initialize when imported
initNotifications();