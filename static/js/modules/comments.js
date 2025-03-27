import { getCSRFToken, debounce } from './utils.js';

class CommentSystem {
  constructor() {
    this.commentInput = document.getElementById("comment-text");
    this.suggestionBox = document.getElementById("mention-suggestions");
    this.commentForm = document.getElementById("comment-form");
    this.commentList = document.getElementById("comment-list");
    
    this.selectedIndex = -1;
    this.debounceTimeout = null;
    
    this.init();
  }

  init() {
    if (!this.validateElements()) return;
    
    this.setupEventListeners();
    this.setupModals();
  }

  validateElements() {
    if (!this.commentInput || !this.suggestionBox || !this.commentForm) {
      console.warn('Comment elements not found');
      return false;
    }
    return true;
  }

  setupEventListeners() {
    this.commentInput.addEventListener("keyup", (event) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => this.handleKeyUp(event), 300);
    });

    this.commentForm.addEventListener("submit", (event) => this.handleSubmit(event));
  }

  setupModals() {
    const showMoreButton = document.getElementById("show-more-comments");
    const modalComments = document.getElementById("comments-modal");
    const closeButton = document.querySelector(".close");

    if (showMoreButton) {
      showMoreButton.addEventListener("click", () => {
        modalComments.style.display = "block";
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        modalComments.style.display = "none";
      });
    }

    window.addEventListener("click", (event) => {
      if (event.target === modalComments) {
        modalComments.style.display = "none";
      }
    });
  }

  async handleKeyUp(event) {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(event.key)) {
      this.handleKeyNavigation(event);
      return;
    }

    const cursorPosition = this.commentInput.selectionStart;
    const text = this.commentInput.value.substring(0, cursorPosition);
    const match = text.match(/@\w+$/);

    if (match) {
      const query = match[0].substring(1);
      if (query.length > 0) {
        try {
          const response = await fetch(`/users/search_users/?q=${query}`);
          const data = await response.json();
          this.updateSuggestions(data, cursorPosition);
        } catch (error) {
          console.error("Error fetching user suggestions:", error);
          this.hideSuggestions();
        }
      } else {
        this.hideSuggestions();
      }
    } else {
      this.hideSuggestions();
    }
  }

  updateSuggestions(users, cursorPosition) {
    this.suggestionBox.innerHTML = "";
    
    if (users.length === 0) {
      this.hideSuggestions();
      return;
    }

    users.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user.username;
      li.setAttribute("data-username", user.username);
      li.addEventListener("click", () => this.insertMention(user.username, cursorPosition));
      this.suggestionBox.appendChild(li);
    });

    this.selectedIndex = -1;
    this.showSuggestions();
  }

  showSuggestions() {
    if (this.suggestionBox.innerHTML.trim() !== "") {
      this.suggestionBox.style.display = "block";
    }
  }

  hideSuggestions() {
    this.suggestionBox.innerHTML = "";
    this.suggestionBox.style.display = "none";
  }

  insertMention(username, cursorPosition) {
    const text = this.commentInput.value;
    const beforeMention = text.substring(0, cursorPosition).replace(/@\w*$/, `@${username} `);
    const afterMention = text.substring(cursorPosition);
    this.commentInput.value = beforeMention + afterMention;
    this.commentInput.focus();
    this.hideSuggestions();
  }

  handleKeyNavigation(event) {
    const items = this.suggestionBox.getElementsByTagName("li");
    if (!items.length) return;

    switch (event.key) {
      case "ArrowDown":
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        break;
      case "ArrowUp":
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        break;
      case "Enter":
        if (this.selectedIndex >= 0) {
          event.preventDefault();
          items[this.selectedIndex].click();
        }
        break;
      case "Escape":
        this.hideSuggestions();
        break;
    }

    Array.from(items).forEach((item, index) => {
      item.style.background = index === this.selectedIndex ? "#f0f0f0" : "white";
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const text = this.commentInput.value.trim();
    if (!text) return;

    const commentId = this.commentForm.dataset.commentId;

    try {
      const response = await fetch(`/tasks/${commentId}/add_comment/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message) {
        this.addCommentToDOM(data.user, data.comment);
        this.commentInput.value = "";
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      // Add user feedback here
    }
  }

  addCommentToDOM(user, comment) {
    if (!this.commentList) return;
    
    const newComment = document.createElement("li");
    newComment.innerHTML = `<strong>${user}:</strong> ${comment}`;
    this.commentList.appendChild(newComment);
  }
}

// Initialize the comment system when imported
export default function initComments() {
  return new CommentSystem();
}