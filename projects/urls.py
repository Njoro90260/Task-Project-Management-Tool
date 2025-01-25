"""Defines url patterns for the website."""

from django.urls import path
from . import views

app_name = 'projects'
urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('create_project_and_tasks/', views.create_project_and_tasks, name='create_project_and_tasks'),
]