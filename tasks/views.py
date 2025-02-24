from django.shortcuts import render, redirect, get_object_or_404
from projects.models import Task, Comment
from projects.utils import user_has_permission
from django.contrib import messages
from projects.forms import TaskForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from .models import TaskFile
from .forms import TaskFileUploadFrom
import os

# Create your views here.
def edit_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    project = task.project

    if not user_has_permission(request.user, project, 'change_task'):
        messages.error(request, "You are not a member of this project or lack the required permissions.")
    
    if request.method == "POST":
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            messages.success(request, "Task updated successfully.")
            return redirect('projects:dashboard')
        
    else:
        form = TaskForm(instance=task)

    context = {
        "form": form,
        "task": task
    }
    return render(request, "tasks/edit_task.html", context)


@login_required
def kanban_board(request):
    form = TaskForm()

    # Handle task creation form submission
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.assigned_to = request.user  # Ensure task is assigned to the user creating it
            task.save()
            return redirect('tasks:kanban-board')

    user = request.user  

    # Group tasks by their status (Only assigned tasks)
    task_todo = Task.objects.filter(status="To Do", assigned_to=user)
    task_in_progress = Task.objects.filter(status="In Progress", assigned_to=user)
    task_completed = Task.objects.filter(status="Completed", assigned_to=user)

    context = {
        "task_todo": task_todo,
        "task_in_progress": task_in_progress,
        "task_completed": task_completed,
        "form": form
    }

    return render(request, "tasks/kanban_board.html", context)


@login_required
def task_detail(request, task_id):
    """Displays the task details along with its comments."""
    task = get_object_or_404(Task, id=task_id)
    project = task.project
    files = task.files.all() 
    can_delete_files = user_has_permission(request.user, project, "delete_task_file")
    comments = Comment.objects.filter(task=task).order_by('-created_at')
    context = {
        "task": task,
        "comments": comments,
        "files": files,
        "can_delete_files": can_delete_files
    }
    return render(request, "tasks/task_detail.html", context)

@csrf_exempt
def add_comment(request, task_id):
    """"Handles adding comments to a task and notifying mentioned users."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            text = data.get("text")

            if not text:
                return JsonResponse({"error": "Comment text is required."}, status=400)

            task = Task.objects.get(id=task_id)
            comment = Comment.objects.create(task=task, author=request.user, content=text)

            return JsonResponse({
                "message": "Comment added successfully",
                "user": request.user.username,
                "comment": comment.content
            })
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)
        
    return JsonResponse({"error": "Invalid request method"}, status=405)

@login_required
def upload_task_file(request, task_id):
    task = get_object_or_404(Task, id=task_id)

    if request.method == "POST":
        form = TaskFileUploadFrom(request.POST, request.FILES)
        if form.is_valid():
            task_file = form.save(commit=False)
            task_file.task = task
            task_file.uploaded_by = request.user
            task_file.save()

            response_data = {
                "message": "File uploaded successfully!",
                "file_url": task_file.file.url
            }
            return JsonResponse(response_data)
        return JsonResponse({"error": "Invalid file upload"}, status=400)
    
    return JsonResponse({"error": "Invalid request"}, status=400)


@login_required
def delete_task_file(request, file_id):
    """Deletes a task file if the user has the necessary permissions"""
    file = get_object_or_404(TaskFile, id=file_id)
    task = file.task 
    project = task.project 

    if not user_has_permission(request.user, project, "delete_task_file"):
        return JsonResponse({"error": "You do not have permission to delete this file."}, status=403)

    file_path = file.file.path  # Get the actual file path
    file.delete()  # Remove the file record from the database

    # Remove the actual file from storage
    if os.path.exists(file_path):
        os.remove(file_path)

    return JsonResponse({"message": "File deleted successfully!"})