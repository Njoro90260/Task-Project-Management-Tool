"""Defines url patterns for the website."""

from django.urls import path
from . import views

app_name = 'projects'
urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('create_project_and_tasks/', views.create_project_and_tasks, name='create_project_and_tasks'),
    path('create_project_and_tasks/<int:project_id>/', views.create_project_and_tasks, name='create_project_and_tasks'),
    path('projects/<int:project_id>/assign_role/', views.assign_role, name='assign_role'),
    path('projects/<int:project_id>/add_user_and_assign_role/', views.add_user_and_assign_role, name='add_user_and_assign_role'),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('project-details/<int:project_id>/', views.project_detail, name="project_detail"),
    path('toggle_theme/', views.toggle_theme, name='toggle_theme'),
]