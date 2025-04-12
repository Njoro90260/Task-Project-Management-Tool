export default function initDashboard() {
    // Load Chart.js from CDN if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            initializeChart();
            initializeModals();
        };
        script.onerror = () => console.error('Failed to load Chart.js');
        document.head.appendChild(script);
    } else {
        initializeChart();
        initializeModals();
    }

    function initializeChart() {
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
                            '#28a745',
                            '#ffc107',
                            '#dc3545'
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
        }
    }

    function initializeModals() {
        // Projects modal
        const showAllProjectsBtn = document.getElementById('show-all-projects');
        if (showAllProjectsBtn) {
            showAllProjectsBtn.addEventListener('click', () => {
                const modalEl = document.getElementById('projects-modal');
                if (modalEl) {
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
            });
        }

        // comments modal
        const showMoreButton = document.getElementById("show-more-comments");
        const modalComments = document.getElementById("comments-modal");

        if (showMoreButton && modalComments) {
            showMoreButton.addEventListener("click", () => {
                const modal = new bootstrap.Modal(modalComments);
                modal.show();
            });
        }
    }
}