from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from django.contrib.auth.decorators import login_required

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

    context = {
        'user_projects': user_projects,
        'user_tasks': user_tasks
    }
    return render(request, 'projects/dashboard.html', context)