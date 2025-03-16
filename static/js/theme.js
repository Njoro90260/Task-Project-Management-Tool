document.addEventListener("DOMContentLoaded", function () {
    const themeSwitch = document.getElementById('theme-switch');
    let theme = "{{ request.session.theme }}";
    function toggleTheme() {
        theme = theme === "dark" ? "light" : "dark";
        document.body.classList.toggle("bg-dark");
        document.body.classList.toggle("text-white");

        fetch("{% url 'projects:toggle_theme' %}", {
            method: "POST",
            headers: {
                "X-CSRFToken": "{{ csrf_token }}",
            },
            body: JSON.stringify({ theme: theme }),
        }).then(response => {
            if (response.ok) {
                if (theme === "dark") {
                    themeSwitch.innerHTML = '<i class="bi bi-moon-stars"></i> Toggle Theme';
                } else {
                    themeSwitch.innerHTML = '<i class="bi bi-sun"></i> Toggle Theme';
                }
            } else {
                console.error("Failed to update theme.");
            }
        }).catch(error => {
            console.error("Error:", error);
        });
    }

    if (theme === "dark") {
        themeSwitch.innerHTML = '<i class="bi bi-moon-stars"></i> Toggle Theme';
    } else {
        themeSwitch.innerHTML = '<i class="bi bi-sun"></i> Toggle Theme';
    }

    themeSwitch.addEventListener('click', toggleTheme);
});