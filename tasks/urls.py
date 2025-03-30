from django.urls import path
from . import views

app_name = 'tasks'
urlpatterns = [
    path('<int:task_id>/edit/', views.edit_task, name='edit_task'),
    path("kanban/", views.kanban_board, name="kanban-board"),
    path('<int:task_id>/', views.task_detail, name='task_detail'),
    path('<int:task_id>/add_comment/', views.add_comment, name='add_comment'),
    path("<int:task_id>/upload/", views.upload_task_file, name="upload_task_file"),
    path("file/<int:file_id>/delete/", views.delete_task_file, name="delete_task_file"),
    path("api/search/", views.search_api, name="search_tasks_api"),
    path("search/", views.search_view, name="search"),
    path("search/results/", views.search_results_view, name="search-results"),
]