"""Defines url patterns for the website."""

from django.urls import path
from . import views

app_name = 'projects'
urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('create_project_and_tasks/', views.create_project_and_tasks, name='create_project_and_tasks'),
    path('create_project_and_tasks/<int:project_id>/', views.create_project_and_tasks, name='create_project_and_tasks'),
    path("kanban/", views.kanban_board, name="kanban-board"),
    path('projects/<int:project_id>/tasks/<int:task_id>/edit/', views.edit_task, name='edit_task'),
    # path("update-task-status/", views.update_task_status, name="update_task_status"),
]