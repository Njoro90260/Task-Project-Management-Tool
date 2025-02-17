from django.urls import path
from . import views

app_name = 'tasks'
urlpatterns = [
    path('/<int:task_id>/edit/', views.edit_task, name='edit_task'),
    path("kanban/", views.kanban_board, name="kanban-board"),
    path('<int:task_id>/', views.task_detail, name='task_detail'),
    path('<int:task_id>/add_comment/', views.add_comment, name='add_comment'),
]