import { getCSRFToken, debounce } from './utils.js';
import initNotifications from './modules/notifications.js';

export default function initComments() {
    const commentInput = document.getElementById("comment-text");
    const suggestionBox = document.getElementById("mention-suggestions");
    const commentForm = document.getElementById("comment-form");
    const commentList = document.getElementById("comment-list");
    
    if (!commentInput || !suggestionBox || !commentForm) return;

    let selectedIndex = -1;
    let debounceTimeout;

    commentInput.addEventListener("keyup", function (event) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => handleKeyUp(event), 300);
    });

    // handle keyup event for comment input
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
        // update suggestions for mentions
        function updateSuggestions(users, cursorPosition) {
            suggestionBox.innerHTML = "";
            if (users.length === 0) {
                hideSuggestions();
                return;
            }

            users.forEach((user, index) => {
                const div = document.createElement("div");
                div.className = "suggestion";
                div.textContent = user.username;
                div.addEventListener("click", () => insertMention(user.username, cursorPosition));
                suggestionBox.appendChild(div);
            });

            selectedIndex = -1; // reset selection
            showSuggestions();

        }
        // show suggestions box
        function showSuggestions() {
            if (suggestionBox.innerHTML.trim() !== "") {
                suggestionBox.style.display = "block";
            }
        }
        // hide suggestions box
        function hideSuggestions() {
            suggestionBox.innerHTML = "";
            suggestionBox.style.display = "none";
        }
        // insert mention into comment input
        function insertMention(username, cursorPosition) {
            const text = commentInput.value;
            const beforeMention = text.substring(0, cursorPosition).replace(/@\w+$/, "@" + username + " ");
            const afterMention = text.substring(cursorPosition);
            commentInput.value = beforeMention + afterMention;
            commentInput.focus();
            hideSuggestions();
        }
        // handle key navigation for suggestions
        function handleKeyNavigation(event) {
            const items = suggestionBox.getElementsByTagName("div");
            if (!items.length) return;

            if (event.key === "Arrowdown") {
                selectedIndex = (selectedIndex + 1) % items.length;
            } else if (event.key === "ArrowUp") {
                selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
            } else if (event.key === "Enter" && selectedIndex >= 0) {
                event.preventDefault();
                items[selectedIndex].click();
            } else if (event.key === "Escape") {
                hideSuggestions();
            }
            // update selection highlight
            Array.from(items).forEach((item, index) => {
                if (index === selectedIndex) {
                    item.classList.add("selected");
                } else {
                    item.classList.remove("selected");
                }
            });
        } 
        // handle comment form submission
        if (commentForm) {
            commentForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                const text = commentInput.value;
                const commentId = commentForm.dataset.commentId;

                try {
                    const response = await fetch(`/tasks/${commentId}/add_comment/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": getCSRFToken(),
                        },
                        body: JSON.stringify({ text: text }),
                    });
                    const data = await response.json();
                    if (data.message) {
                        if (commentList) {
                            const newComment = document.createElement("li");
                            newComment.innerHTML = `<strong>${data.user}</strong>: ${data.comment}`;
                            commentList.appendChild(newComment);
                            commentInput.value = "";
                        }

                        initNotifications();
                    } else {
                        console.error("Error adding comment:", data.error);
                    }
                } catch (error) {
                    console.error("Error adding comment:", error);
                }
            });
        }
    }
    // comments in the dashboard
    let showMoreButton = document.getElementById("show-more-comments");
    let modalComments = document.getElementById("comments-modal");
    let closeButton = document.querySelector(".close");

    if (showMoreButton) {
        showMoreButton.addEventListener("click", function () {
            modalComments.style.display = "block";
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", function () {
            modalComments.style.display = "none";
        });
    }

    // close the modal if the user clicks outside it 
    window.onclick = function (event) {
        if (event.target === modalComments) {
            modalComments.style.display = "none";
        }
    };
}

// Initialize when imported
initComments();