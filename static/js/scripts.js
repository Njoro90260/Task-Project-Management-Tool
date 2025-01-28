document.addEventListener('DOMContentLoaded', function () {
    const addTaskCheckbox = document.querySelector('input[name="add_task"]');
    const taskDetailsFieldset = document.getElementById('task-details');

    function toggleTaskDetails() {
        if (addTaskCheckbox.checked) {
            taskDetailsFieldset.style.display = 'block';
        } else {
            taskDetailsFieldset.style.display = 'none';
        }
    }

    addTaskCheckbox.addEventListener('change', toggleTaskDetails);
    toggleTaskDetails();  // Initial check on page load
});