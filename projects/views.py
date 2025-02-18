from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from.forms import *
from django.contrib.auth.decorators import login_required
from django.contrib import messages

# Create your views here.
def index(request):
    features = Feature.objects.filter(is_active=True)
    context = {'features': features}
    return render(request, 'projects/index.html', context)

@login_required
def dashboard(request):
    """Dashborad view for the logged-in user."""
    user_projects = Project.objects.filter(created_by=request.user).order_by('-created_at')
    user_tasks = Task.objects.filter(assigned_to=request.user).order_by('-created_at')
    project_progress = {}
    for project in user_projects:
        total_tasks = Task.objects.filter(project=project).count()
        completed_tasks = Task.objects.filter(project=project, status='completed').count()
        progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        project_progress[project.id] = progress

    context = {
        'user_projects': user_projects,
        'user_tasks': user_tasks,
        'project_progress': project_progress
    }
    return render(request, 'projects/dashboard.html', context)


@login_required
def create_project_and_tasks(request):
    """View for creating a new project and optionally adding tasks."""
    if request.method == 'POST':
        project_form = ProjectForm(request.POST)

        if project_form.is_valid():
            project = project_form.save(commit=False)
            project.created_by = request.user
            project.save()

            if 'add_tasks' in request.POST:
                task_form = TaskForm(request.POST)
                if task_form.is_valid():
                    task = task_form.save(commit=False)
                    task.project = project
                    task.save()
                    messages.success(request, 'Project and task created successfully.')
                    return redirect('projects:dashboard')
                else:
                    messages.error(request, 'Task form is invalid. Please correct the errors and try again.')
            else:
                messages.success(request, 'Project created successfully. You can add tasks later.')
                return redirect('projects:dashboard')
        else:
            messages.error(request, 'Project form is invalid. Please correct the errors and try again.')
    else:
        project_form = ProjectForm()
        task_form = TaskForm()

    context = {
        'project_form': project_form,
        'task_form': task_form if 'add_tasks' in request.POST else None,
    }

    return render(request, 'projects/create_project_and_tasks.html', context)