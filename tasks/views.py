from django.shortcuts import render, redirect, get_object_or_404
from projects.models import Task, Comment
from projects.utils import user_has_permission
from django.contrib import messages
from projects.forms import TaskForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

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
            task.save()
            return redirect('tasks:kanban-board')
        
        else:
            form = TaskForm()
            
    # Group tasks by their status and filter by user permissions
    task_todo = Task.objects.filter(status="To Do").filter(project__in=request.user.projects.all())
    task_in_progress = Task.objects.filter(status="In Progress").filter(project__in=request.user.projects.all())
    task_completed = Task.objects.filter(status="Completed").filter(project__in=request.user.projects.all())

    # Filter tasks by user permissions
    task_todo = [task for task in task_todo if user_has_permission(request.user, task.project, 'view_task')]
    task_in_progress = [task for task in task_in_progress if user_has_permission(request.user, task.project, 'view_task')]
    task_completed = [task for task in task_completed if user_has_permission(request.user, task.project, 'view_task')]

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
    context = {
        "task": task
    }
    return render(request, "tasks/task_detail.html", context)

@csrf_exempt
@login_required
def add_comment(request, task_id):
    """Allows users to add comment to a task."""
    if request.method == 'POST':
        task = get_object_or_404(Task, id=task_id)
        text = request.POST.get('comment')

        if text:
            comment = Comment.objects.create(task=task, user=request.user, text=text)
            return JsonResponse({"message": "Comment added", "comment": comment.text, "user": request.user.username}, status=201)
        
        return JsonResponse({"error": "Invalid request"}, status=400)