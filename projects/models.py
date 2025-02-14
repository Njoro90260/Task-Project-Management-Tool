from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.
class Project(models.Model):
    """The projects that will be managed model."""
    name = models.CharField(max_length=255)
    project_description = models.TextField(blank=True)
    created_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_members')
    role = models.CharField(max_length=100, choices=[('Manager', 'Manager'), ('Developer', 'Developer'), ('Tester', 'Tester')])

    def __str__(self):
        return f"{self.user.username} ({self.role}) - {self.project.name}"
    
class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
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
    

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"
    
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