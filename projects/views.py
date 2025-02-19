from .forms import *
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from rest_framework import generics
from .serializers import TaskSerializer
from django.db.models import Count, Q
from django.utils.timezone import now
from django.http import JsonResponse
from projects.utils import user_has_project_role
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model


User = get_user_model()
# Create your views here.
def index(request):
    features = Feature.objects.filter(is_active=True)
    context = {'features': features}
    return render(request, 'projects/index.html', context)


@login_required
def dashboard(request):
    """Dashboard view for the logged-in user."""
    user_projects = Project.objects.filter(created_by=request.user).annotate(
        total_tasks=Count('tasks'),
        completed_tasks=Count('tasks', filter=Q(tasks__status='Completed'))
    ).order_by('-created_at')

    user_tasks = Task.objects.filter(assigned_to=request.user).order_by('-created_at')

    # Task filtering
    overdue_tasks = user_tasks.filter(due_date__lt=now(), status__in=['To Do', 'In Progress'])
    upcoming_tasks = user_tasks.filter(due_date__gte=now())

    # Group tasks by priority
    high_priority_tasks = user_tasks.filter(priority='High')
    medium_priority_tasks = user_tasks.filter(priority='Medium')
    low_priority_tasks = user_tasks.filter(priority='Low')

    project_progress = {
        project.id: (project.completed_tasks / project.total_tasks) * 100 if project.total_tasks > 0 else 0
        for project in user_projects
    }

    context = {
        'user_projects': user_projects,
        'user_tasks': user_tasks,
        'project_progress': project_progress,
        'overdue_tasks': overdue_tasks,
        'upcoming_tasks': upcoming_tasks,
        'high_priority_tasks': high_priority_tasks,
        'medium_priority_tasks': medium_priority_tasks,
        'low_priority_tasks': low_priority_tasks,
    }
    return render(request, 'projects/dashboard.html', context)


def create_project_and_tasks(request, project_id=None):
    """"View for creating a new project and optionally adding tasks."""
    if project_id:
        project = Project.objects.get(id=project_id)
    else:
        project = None

    if request.method == 'POST':
        if project:
            task_form = TaskForm(request.POST)
            project_form = ProjectForm(instance=project)
        else:
            project_form = ProjectForm(request.POST)
            task_form = TaskForm(request.POST) if 'add_tasks' in request.POST else None

        if project_form.is_valid() and not project:
            project = project_form.save(commit=False)
            project.created_by = request.user
            project.save()
            #Assign the role as "Admin" to the project creator
            admin_role, created = Role.objects.get_or_create(name='Admin')
            ProjectRole.objects.create(project=project, user=request.user, role=admin_role)

            messages.success(request, "Project created successfully! You are the Admin.")
            return redirect('projects:create_project_and_tasks', project_id=project.id)

        if task_form and task_form.is_valid():
            task = task_form.save(commit=False)
            task.project = project
            task.save()
            messages.success(request, 'Task added successfully.')
            if 'save_add_another' in request.POST:
                return redirect('projects:create_project_and_tasks', project_id=project.id)
            else:
                return redirect('projects:dashboard')
        elif task_form:
            messages.error(request, 'Task form is invalid. Please correct the errors and try again.')
        else:
            messages.success(request, 'Project created successfully. You can add tasks later.')
            return redirect('projects:dashboard')
    else:
        project_form = ProjectForm(instance=project)
        task_form = TaskForm()

    context = {
        'project_form': project_form,
        'task_form': task_form if project else None,
    }

    return render(request, 'projects/create_project_and_tasks.html', context)


# List all tasks & create new tasks
class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

# Retrieve, update or delete a task
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

def assign_role(request, project_id):
    project = get_object_or_404(Project, id=project_id)

    if not user_has_project_role(request.user, project, "Admin"):
        messages.error(request, "Only Admins can assign roles.")
        return redirect("projects:dashboard")
    
    if request.method == "POST":
        user_id = request.POST.get("user_id")
        role_id = request.POST.get("role_id")

        user = get_object_or_404(User, id=user_id)
        role = get_object_or_404(Role, id=role_id)

        # Remove any existing role for this user in the project
        ProjectRole.objects.filter(project=project, user=user).delete()

        # Assign the new role
        ProjectRole.objects.create(project=project, user=user, role=role)
        messages.success(request, f"Role assigned successfully to {user.username} as {role.name}.")

        return redirect("projects:dashboard")
    
    users = User.objects.exclude(id=project.created_by.id)
    roles = Role.objects.all()

    context = {
        "users": users,
        "roles": roles,
        "project": project
    }
    return render(request, "projects/assign_role.html", context)

@csrf_exempt
@login_required
def add_comment(request, task_id):
    """"Handles adding comments to a task and notifying mentioned users."""
    if request.method == "POST":
        task = Task.objects.get(id=task_id)
        text = request.POST.get("content", "").strip()

        if text:
            comment = Comment.objects.create(task=task, author=request.user, content=text)
            mentioned_users = comment.mentions.all()

            return JsonResponse({"message": "Comment added!", "comment": text, "user": request.user.username, "mentions": [u.username for u in mentioned_users]})
        
        return JsonResponse({"error": "Invalid request"}, status=400)
    
        

def get_notifications(request):
    """Fetch unread notifications for the logged-in user."""
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    notif_list = [{"message": notif.message, "id": notif.id} for notif in notifications]

    return JsonResponse({"count": notifications.count(), "notifications": notif_list})