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
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_POST
from projects.utils import user_has_permission
from django.views.decorators.csrf import csrf_exempt
import json



# Create your views here.
@csrf_exempt
def toggle_theme(request):
    """"View function to change the theme."""
    if request.method == "POST":
        data = json.loads(request.body)
        theme = data.get('theme', 'light')
        request.session['theme'] = theme
        return JsonResponse({"status": "success", "theme": theme})
    return JsonResponse({"status": "error"}, status=400)


User = get_user_model()
def index(request):
    features = Feature.objects.filter(is_active=True)
    context = {'features': features}
    return render(request, 'projects/index.html', context)

@login_required
def dashboard(request):
    """Dashboard view for the logged-in user."""

    # Get projects where the user is a creator or a team member
    user_projects = Project.objects.filter(
        Q(created_by=request.user) | Q(projectrole__user=request.user)
    ).annotate(
        total_tasks=Count('tasks'),
        completed_tasks=Count('tasks', filter=Q(tasks__status='Completed')),
        in_progress_tasks=Count('tasks', filter=Q(tasks__status='In Progress')),
        not_started_tasks=Count('tasks', filter=Q(tasks__status='To Do'))
    ).order_by('-created_at').distinct()
    user_projects_header = user_projects[:3]

    # Calculate overall progress
    total_tasks = sum(project.total_tasks for project in user_projects)
    completed_tasks = sum(project.completed_tasks for project in user_projects)
    in_progress_tasks = sum(project.in_progress_tasks for project in user_projects)
    not_started_tasks = sum(project.not_started_tasks for project in user_projects)

    completed_percentage = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    in_progress_percentage = (in_progress_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    not_started_percentage = (not_started_tasks / total_tasks) * 100 if total_tasks > 0 else 0

    overall_progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0

    # Get tasks assigned to the authenticated user
    user_tasks = Task.objects.filter(assigned_to=request.user).order_by('-created_at')

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

    # Get team members for the projects the user is part of (excluding the user)
    team_members = User.objects.filter(
        Q(teammember__project__in=user_projects) | Q(projectrole__project__in=user_projects)
    ).exclude(id=request.user.id).distinct()

    # Get comments on tasks the user is supposed to see
    visible_comments = Comment.objects.filter(
        Q(task__assigned_to=request.user) | 
        Q(task__project__in=user_projects)
    ).select_related('author', 'task').order_by('-created_at')

    context = {
        'user_projects': user_projects,
        'overall_progress': overall_progress, 
        'user_tasks': user_tasks,
        'project_progress': project_progress,
        'overdue_tasks': overdue_tasks,
        'upcomig_tasks': upcoming_tasks,
        'high_priority_tasks': high_priority_tasks,
        'medium_priority_tasks': medium_priority_tasks,
        'low_priority_tasks': low_priority_tasks,
        'team_members': team_members,
        'user_projects_header': user_projects_header,
        'visible_comments': visible_comments,
        'completed_percentage': completed_percentage,
        'in_progress_percentage': in_progress_percentage,
        'not_started_percentage': not_started_percentage,
    }
    return render(request, 'projects/dashboard.html', context)


@login_required
def project_detail(request, project_id):
    project = get_object_or_404(Project, id=project_id)

    # Get the user's role in the project
    project_role = ProjectRole.objects.filter(user=request.user, project=project).first()
    user_role_name = project_role.role.name if project_role else "No Role"

    # Check if the user has specific permissions
    can_manage_members = user_has_permission(request.user, project, "can_manage_members")
    can_create_tasks = user_has_permission(request.user, project, "can_create_tasks")
    can_edit_tasks = user_has_permission(request.user, project, "can_edit_tasks")
    can_delete_tasks = user_has_permission(request.user, project, "can_delete_tasks")
    can_delete_files = user_has_permission(request.user, project, "can_delete_files")

    is_manager_or_admin = project_role and project_role.role.name in ["Manager", "Admin"]

    # Get tasks related to the project
    tasks = Task.objects.filter(project=project).select_related("assigned_to").order_by("status", "priority", "due_date")


    context = {
        "project": project,
        "tasks": tasks,
        "user_role_name": user_role_name, 
        "can_manage_members": can_manage_members,
        "can_create_tasks": can_create_tasks,
        "can_edit_tasks": can_edit_tasks,
        "can_delete_tasks": can_delete_tasks,
        "can_delete_files": can_delete_files,
        "is_manager_or_admin": is_manager_or_admin,
    }

    return render(request, "projects/project_detail.html", context)



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

        assign_role_to_user(project, user, role, request.user)
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

def assign_role_to_user(project, user, role, change_by):
    """Assigns a role to a user in a project and creates a notification."""
    # Remove any existing role for this user in the project
    ProjectRole.objects.filter(project=project, user=user).delete()

    # Assign the new role
    ProjectRole.objects.create(project=project, user=user, role=role)

    # Create a notification for the user
    Notification.objects.create(
        user=user,
        project=project,
        message=f"Your role in project '{project.name}' has been changed to {role.name} by {change_by.username}.",
        notification_type="role_changed"
    )

@login_required
def add_user_and_assign_role(request, project_id):
    project = get_object_or_404(Project, id=project_id)

    if not user_has_project_role(request.user, project, "Admin"):
        messages.error(request, "Only Admins can add users and assign roles.")
        return redirect("projects:dashboard")

    if request.method == "POST":
        user_id = request.POST.get("user_id")
        role_id = request.POST.get("role_id")

        user = get_object_or_404(User, id=user_id)
        role = get_object_or_404(Role, id=role_id)

        # Add user to the project and assign the role
        add_user_to_project(project, user, role, request.user)
        messages.success(request, f"User {user.username} added to the project and assigned the role {role.name}.")

        return redirect("projects:dashboard")

    users = User.objects.exclude(id=project.created_by.id)
    roles = Role.objects.all()

    context = {
        "users": users,
        "roles": roles,
        "project": project
    }
    return render(request, "projects/add_user_and_assign_role.html", context)

def add_user_to_project(project, user, role, added_by):
    """Adds a user to a project, assigns a role, and creates a notification."""
    # Check if the user already has a role in the project
    project_role, created = ProjectRole.objects.update_or_create(
        project=project,
        user=user,
        defaults={'role': role}
    )

    if created:
        # Create a notification for the user
        Notification.objects.create(
            user=user,
            project=project,
            message=f"You have been added to the project '{project.name}' by {added_by.username} as {role.name}.",
            notification_type="project_added"
        )
    else:
        # Create a notification for the user about the role change
        Notification.objects.create(
            user=user,
            project=project,
            message=f"Your role in project '{project.name}' has been changed to {role.name} by {added_by.username}.",
            notification_type="role_changed"
        )

def get_notifications(request):
    """Fetch unread notifications for the logged-in user."""
    notifications = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')

    data = [
        {
            "id": notif.id,
            "message": notif.message,
            "url": notif.get_notification_url(),
            "created_at": notif.created_at.strftime("%Y-%m-%d %H:%M:%S"),

        }
        for notif in notifications
    ]

    return JsonResponse({"count": notifications.count(), "notifications": data})

@require_POST
def mark_notification_as_read(request, notification_id):
    """Mark a single notification as read."""
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    return JsonResponse({"success": True})

@login_required
@require_POST
def clear_notifications(request):
    """Clear all notifications for the logged-in user."""
    if request.method == "POST":
        Notification.objects.filter(user=request.user).delete()
        return JsonResponse({"message": "Notifications cleared successfully!"})
    return JsonResponse({"error": "Invalid request."}, status=400)