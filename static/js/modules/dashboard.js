export default function initDashboard() {
    // Load Chart.js from CDN if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = initializeChart;
        script.onerror = () => console.error('Failed to load Chart.js');
        document.head.appendChild(script);
    } else {
        initializeChart();
    }

    function initializeChart() {
        // Initialize the doughnut chart
        const ctx = document.getElementById('projectProgressChart');
        if (ctx && typeof Chart !== 'undefined') {
            const completed = parseFloat(ctx.dataset.completed || '0');
            const inProgress = parseFloat(ctx.dataset.inProgress || '0');
            const notStarted = parseFloat(ctx.dataset.notStarted || '0');

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Not Started'],
                    datasets: [{
                        data: [completed, inProgress, notStarted],
                        backgroundColor: [
                            '#28a745', // green
                            '#ffc107', // yellow
                            '#dc3545'  // red
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.raw}%`;
                                }
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        } else {
            console.error('Chart.js not available or canvas element not found');
        }
    }

    // Show all projects modal (independent of Chart.js)
    const showAllBtn = document.getElementById('show-all-projects');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            const modalEl = new bootstrap.Modal(document.getElementById('projects-modal'));
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }
}