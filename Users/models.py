from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from projects.models import Project
from django.contrib.auth import get_user_model
class Role(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Team Member', 'Team Member'),
    ]
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    roles = models.ManyToManyField('Role', related_name='users')
    groups = models.ManyToManyField(Group, related_name='custom_user_groups', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_permissions', blank=True)


class ProjectRole(models.Model):
    """This model links Users, Projects, and Roles, ensuring users have different roles in different projects."""
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['user', 'project']

    def __str__(self):
        return f'{self.user.username} - {self.role.name} - {self.project.name}'
    
class ProjectPermission(models.Model):
    """" Custom model to define fine-grained access control."""
    project_role = models.ForeignKey(ProjectRole, on_delete=models.CASCADE)
    can_create_tasks = models.BooleanField(default=False)
    can_edit_tasks = models.BooleanField(default=False)
    can_delete_tasks = models.BooleanField(default=False)
    can_manage_members = models.BooleanField(default=False)

    def __str__(self):
        return f"Permissions for {self.project_role.user.username} in {self.project_role.project.name}"
    


