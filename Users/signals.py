from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import User, Role
from projects.models import ProjectRole, ProjectPermission

# @receiver(post_save, sender=User)
# def assign_default_role(sender, instance, created, **kwargs):
#     if created and not instance.roles.exists():
#         default_role, _ = Role.objects.get_or_create(name='Team Member')
#         instance.roles.add(default_role)

print("🚀 Signals.py is being loaded...") # debug print statement


@receiver(post_migrate)
def set_default_permissions(sender, **kwargs):
    """Ensure permissions are set correctly for all existing ProjectRoles after migrations."""
    if sender.name == "projects": 
        for role in ProjectRole.objects.all():
            permissions, created = ProjectPermission.objects.get_or_create(project_role=role)

            if role.role.name == "Admin":
                permissions.can_create_tasks = True
                permissions.can_edit_tasks = True
                permissions.can_delete_tasks = True
                permissions.can_manage_members = True
                permissions.can_delete_files = True

            elif role.role.name == "Manager":
                permissions.can_create_tasks = True
                permissions.can_edit_tasks = True
                permissions.can_delete_tasks = False
                permissions.can_manage_members = True
                permissions.can_delete_files = True

            elif role.role.name == "Team Member":
                permissions.can_create_tasks = True
                permissions.can_edit_tasks = False
                permissions.can_delete_tasks = False
                permissions.can_manage_members = False
                permissions.can_delete_files = False

            permissions.save()
            print(f"Permissions updated for {role.user.username} - {role.role.name}")

