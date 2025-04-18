from django.db import models
from projects.models import Task
from django.conf import settings

# Create your models here.
user = settings.AUTH_USER_MODEL
class SubTask(models.Model):
    parent_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
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
    assigned_to = models.ForeignKey(user, on_delete=models.SET_NULL, null=True, blank=True, related_name='subtasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (Subtask of {self.parent_task.title})"


    
class TaskHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='history')
    updated_by = models.ForeignKey(user, on_delete=models.SET_NULL, null=True)
    change_description = models.TextField()
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History of {self.task.title} - Updated by {self.updated_by.username if self.updated_by else 'Unknown'}"
    
class TaskChecklists(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='checklists')
    item_name = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.item_name} ({'Completed' if self.is_completed else 'Pending'}) - {self.task.title}"
    
from django.contrib.auth import get_user_model
class TaskFile(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="files")
    uploaded_by = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    file = models.FileField(upload_to="task_files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} uploaded by {self.uploaded_by}"


    