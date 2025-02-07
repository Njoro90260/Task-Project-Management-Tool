document.addEventListener('DOMContentLoaded', function () {
    // Handle showing/hiding task details
    const addTaskCheckbox = document.querySelector('input[name="add_task"]');
    const taskDetailsFieldset = document.getElementById('task-details');

    function toggleTaskDetails() {
        if (addTaskCheckbox && taskDetailsFieldset) {
            taskDetailsFieldset.style.display = addTaskCheckbox.checked ? 'block' : 'none';
        }
    }

    if (addTaskCheckbox) {
        addTaskCheckbox.addEventListener('change', toggleTaskDetails);
        toggleTaskDetails(); // Initial check on page load
    }
});