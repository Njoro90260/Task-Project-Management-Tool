from django.db import models
from django.conf import settings
from Users.models import Role
from django.utils.text import slugify
import re
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse

# Create your models here.
user = settings.AUTH_USER_MODEL
class Project(models.Model):
    """The projects that will be managed model."""
    name = models.CharField(max_length=255)
    project_description = models.TextField(blank=True)
    created_by = models.ForeignKey(user, on_delete=models.CASCADE, related_name='owned_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(blank=True, null=True)
    members = models.ManyToManyField(user, through="ProjectRole", related_name="projects")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Assign creator as Admin
        admin_role, created = Role.objects.get_or_create(name='Admin')
        self.created_by.roles.add(admin_role)

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    user = models.ForeignKey(user, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_members')
    role = models.CharField(max_length=100, choices=[('Manager', 'Manager'), ('Developer', 'Developer'), ('Tester', 'Tester')])

    def __str__(self):
        return f"{self.user.username} ({self.role}) - {self.project.name}"
    
class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(user, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=255)
    task_description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ('To Do', 'To Do'),
            ('In Progress', 'In Progress'),
            ('Completed', 'Completed'),
        ],
        default='To Do'
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('Low', 'Low'),
            ('Medium', 'Medium'),
            ('High', 'High'),
        ],
        default='Medium'
    )
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.project.name}"
    
    @property
    def is_overdue(self):
        return self.due_date and self.due_date < timezone.now().date() and self.status != 'Completed'
    
    def get_absolute_url(self):
        return reverse('tasks:task_detail', args=[str(self.id)])
    

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(user, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    mentions = models.ManyToManyField(user, related_name='mentioned_in_comments', blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.extract_mentions()

    def extract_mentions(self):
        """Extract @mentions from the comment text and notify users."""
        mention_pattern=re.compile(r"@(\w+)")
        mentioned_usernames = re.findall(r'@(\w+)', self.content) # Extract mentioned usernames
        mentioned_users = get_user_model().objects.filter(username__in=mentioned_usernames)
        self.mentions.set(mentioned_users)
        for user in mentioned_users:
            Notification.objects.create(
                user=user,
                task=self.task,
                message=f"You were mentioned in a comment: {self.content}"
            )

        def __str__(self):
            return f"Comment by {self.author.username}: {self.content[:50]}"
    

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("project_added", "Added to a Project"),
        ("role_assigned", "Role Assigned"),
        ("mentioned", "Mentioned in a Task"),
        ("member_added", "Team Member Added"),
        ("role_changed", "Role Changed"),
    ]

    user = models.ForeignKey(user, on_delete=models.CASCADE, related_name="notifications")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(
        max_length=20, 
        choices=NOTIFICATION_TYPES, 
        default="project_added"  
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.message[:50]}"

    def get_notification_url(self):
        if self.task:
            return f"/tasks/{self.task.id}/"
        elif self.project:
            return f"/project-details/{self.project.id}/"
        return "#"

class Feature(models.Model):
    title = models.CharField(max_length=100, help_text="Short title of the feature, e.g., 'Task Management'")
    description = models.TextField(help_text="Detailed description of the feature")
    svg_icon = models.TextField(
        help_text="Inline SVG markup for custom icons",
        blank=True,
        null=True, 
    )
    icon_file = models.FileField(
        upload_to='feature_icons/', 
        blank=True, null=True, 
        help_text="Upload an SVG file"
    )
    is_active = models.BooleanField(default=True, help_text="Display this on the homepage?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']
        verbose_name = "Feature"
        verbose_name_plural = "Features"

    def __str__(self):
        return self.title
    
class ProjectPermission(models.Model):
    """" Custom model to define fine-grained access control."""
    project_role = models.OneToOneField("projects.ProjectRole", on_delete=models.CASCADE, related_name="permission")
    can_create_tasks = models.BooleanField(default=False)
    can_edit_tasks = models.BooleanField(default=False)
    can_delete_tasks = models.BooleanField(default=False)
    can_manage_members = models.BooleanField(default=False)
    can_delete_files = models.BooleanField(default=False)

    def __str__(self):
        return f"Permissions for {self.project_role.user.username} in {self.project_role.project.name}"
    


class ProjectRole(models.Model):
    """This model links Users, Projects, and Roles, ensuring users have different roles in different projects."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    permissions = models.OneToOneField(ProjectPermission, on_delete=models.CASCADE, related_name="role_permissions", null=True, blank=True)
    class Meta:
        unique_together = ('user', 'project', 'role')

    def __str__(self):
        return f'{self.user.username} - {self.role.name} - {self.project.name}'
    

def create_notifications(task, mentioned_usernames):
    mentioned_users = get_user_model().objects.filter(username__in=mentioned_usernames)
    for user in mentioned_users:
        Notification.objects.create(
            user=user,
            task=task,
            message=f"You were mentioned in a task '{task.title}'"
        )



