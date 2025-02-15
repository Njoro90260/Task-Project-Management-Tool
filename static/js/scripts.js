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
    // comments
});