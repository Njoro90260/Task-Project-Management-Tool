from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
# from projects.models import ProjectRole
class Role(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Team Member', 'Team Member'),
    ]
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    permissions = models.ManyToManyField('auth.Permission', related_name='roles', blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    roles = models.ManyToManyField('Role', related_name='users')
    groups = models.ManyToManyField(Group, related_name='custom_user_groups', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_permissions', blank=True)


# def user_has_permission(user, project, permission_codename):
#     """Check if the user has the specified permission for a given project."""
#     project_roles = ProjectRole.objects.filter(user=user, project=project)

#     for project_role in project_roles:
#         if project_role.role.permissions.filter(codename=permission_codename).exists():
#             return True
#     return False

    
