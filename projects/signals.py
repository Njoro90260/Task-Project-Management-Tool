from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps
from projects.models import ProjectRole, ProjectPermission

@receiver(post_migrate)
def set_default_permissions(sender, **kwargs):
    """Ensure all ProjectRole instances have permissions after migrations."""
    if sender.name == "projects":  # ✅ Only run for the 'projects' app
        print("🚀 Running `set_default_permissions` after migrations...")

        for role in ProjectRole.objects.all():
            permissions, created = ProjectPermission.objects.get_or_create(project_role=role)

            if role.role.name == "Admin":
                permissions.can_create_tasks = True
                permissions.can_edit_tasks = True
                permissions.can_delete_tasks = True
                permissions.can_manage_members = True
                permissions.can_delete_files = True
                permissions.can_delete_project = True

            elif role.role.name == "Manager":
                permissions.can_create_tasks = True
                permissions.can_edit_tasks = True
                permissions.can_delete_tasks = False
                permissions.can_manage_members = True
                permissions.can_delete_files = True
                permissions.can_delete_project = False

            elif role.role.name == "Team Member":
                permissions.can_create_tasks = True
                permissions.can_edit_tasks = False
                permissions.can_delete_tasks = False
                permissions.can_manage_members = False
                permissions.can_delete_files = False
                permissions.can_delete_project = False

            permissions.save()
            print(f"✅ Permissions updated for {role.user.username} - {role.role.name}")
