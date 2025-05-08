from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps
from projects.models import ProjectRole, ProjectPermission

@receiver(post_migrate)
def set_default_permissions(sender, **kwargs):
    """Ensure all ProjectRole instances have permissions after migrations."""
    if sender.name == "projects":  
        print("🚀 Running `set_default_permissions` after migrations...")

        for role in ProjectRole.objects.all():
            # Set defaults for all boolean fields
            defaults = {
                'can_create_tasks': False,
                'can_edit_tasks': False,
                'can_delete_tasks': False,
                'can_manage_members': False,
                'can_delete_files': False,
                'can_delete_project': False  # Add this line
            }

            if role.role.name == "Admin":
                defaults.update({
                    'can_create_tasks': True,
                    'can_edit_tasks': True,
                    'can_delete_tasks': True,
                    'can_manage_members': True,
                    'can_delete_files': True,
                    'can_delete_project': True 
                })
            elif role.role.name == "Manager":
                defaults.update({
                    'can_create_tasks': True,
                    'can_edit_tasks': True,
                    'can_delete_tasks': False,
                    'can_manage_members': True,
                    'can_delete_files': True,
                    'can_delete_project': False  
                })
            elif role.role.name == "Team Member":
                defaults.update({
                    'can_create_tasks': True,
                    'can_edit_tasks': False,
                    'can_delete_tasks': False,
                    'can_manage_members': False,
                    'can_delete_files': False,
                    'can_delete_project': False
                })

            permissions, created = ProjectPermission.objects.get_or_create(
                project_role=role,
                defaults=defaults
            )
            
            # Update existing permissions if they were found
            if not created:
                for key, value in defaults.items():
                    setattr(permissions, key, value)
                permissions.save()

            print(f"✅ Permissions updated for {role.user.username} - {role.role.name}")