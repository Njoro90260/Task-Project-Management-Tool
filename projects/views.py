from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from.forms import *
from django.contrib.auth.decorators import login_required

# Create your views here.
def index(request):
    if request.user.is_authenticated:
        return redirect('projects:dashboard')
    return render(request, 'projects/index.html')

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
def create_project(request):
    """View to create a new project."""
    if request.method == 'POST':
        form = ProjectForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.created_by = request.user
            project.save()
            return redirect('projects:dashboard')
    else:
        form = ProjectForm()

    context = {
        'form': form
    }
    return render(request, 'projects/create_project.html', context)