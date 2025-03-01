from django.urls import path
from .views import TaskListCreateView, TaskDetailView
from tasks.views import get_tasks

urlpatterns = [
    path('tasks/', get_tasks, name='task-list'),
    # path('tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
]
