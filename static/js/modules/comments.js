import { getCSRFToken, debounce } from './utils.js';

export default function initComments() {
    const commentInput = document.getElementById("comment-text");
    const suggestionBox = document.getElementById("mention-suggestions");
    const commentForm = document.getElementById("comment-form");
    
    if (!commentInput || !suggestionBox || !commentForm) return;

    let selectedIndex = -1;
    let debounceTimeout;

    commentInput.addEventListener("keyup", function (event) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => handleKeyUp(event), 300);
    });

    // ... rest of the comment handling code from original file
    // (handleKeyUp, updateSuggestions, show/hideSuggestions, insertMention, etc.)
}

// Initialize when imported
initComments();