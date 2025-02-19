document.getElementById("comment-form").addEventListener("submit", function(event) {
    event.preventDefault();
    let text = document.getElementById("comment-text").value;

    fetch("{% url 'add_comment' task.id %}", {
        method: "POST",
        headers: {
            "X-CSRFToken": "{{ csrf_token }}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "text=" + encodeURIComponent(text)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            let newComment = document.createElement("li");
            newComment.innerHTML = `<strong>${data.user}:</strong> ${data.comment}`;
            document.getElementById("comment-list").appendChild(newComment);
            document.getElementById("comment-text").value = "";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
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
            });
    }

    fetchNotifications();
    setInterval(fetchNotifications, 5000);
});
