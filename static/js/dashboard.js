document.addEventListener('DOMContentLoaded', function () {
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded. Make sure it is included in your template.');
        return;
    }

    // Select all project chart canvases
    const projectCharts = document.querySelectorAll('canvas[id^="projectChart"]');

    projectCharts.forEach(canvas => {
        const projectId = canvas.id.replace('projectChart', '');
        
        // Get the progress safely
        const badge = canvas.closest('.card-body').querySelector('.badge');
        if (!badge) {
            console.warn(`Progress badge not found for project ${projectId}`);
            return;
        }

        const progressText = badge.innerText.match(/\d+(\.\d+)?/);
        if (!progressText) {
            console.warn(`Invalid progress value for project ${projectId}`);
            return;
        }

        const progress = parseFloat(progressText[0]);
        
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [progress, 100 - progress],
                    backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: `Project Progress` }
                }
            }
        });
    });

    // Task Distribution Pie Chart
    const taskChartElement = document.getElementById('taskDistributionChart');
    if (taskChartElement) {
        new Chart(taskChartElement, {
            type: 'pie',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    label: 'Task Distribution',
                    data: [45, 30, 25],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Task Distribution' }
                }
            }
        });
    } else {
        console.warn('Task Distribution Chart element not found.');
    }

    // Bar Chart for Monthly Task Completion
    const monthlyTaskChartElement = document.getElementById('monthlyTaskChart');
    if (monthlyTaskChartElement) {
        new Chart(monthlyTaskChartElement, {
            type: 'bar',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [12, 19, 3, 5, 2, 3, 10],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Monthly Task Completion' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } else {
        console.warn('Monthly Task Chart element not found.');
    }
});
