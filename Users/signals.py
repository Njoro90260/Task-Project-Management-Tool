from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Role, ProjectRole, ProjectPermission

@receiver(post_save, sender=User)
def assign_default_role(sender, instance, created, **kwargs):
    if created and not instance.roles.exists():
        default_role, _ = Role.objects.get_or_create(name='Team Member')
        instance.roles.add(default_role)

@ receiver(post_save, sender=ProjectRole)
def set_default_permissions(sender, instance, created, **kwargs):
    if created:
        if instance.role.name == "Admin":
            ProjectPermission.objects.create(
                project_role=instance,
                can_create_tasks=True,
                can_edit_tasks=True,
                can_delete_tasks=True,
                can_manage_members=True
            )
        elif instance.role.name == "Manager":
            ProjectPermission.objects.create(
                project_role=instance,
                can_create_tasks=True,
                can_edit_tasks=True,
                can_delete_tasks=False,
                can_manage_members=True
            )
        elif instance.role.name == "Team Member":
            ProjectPermission.objects.create(
                project_role=instance,
                can_create_tasks=True,
                can_edit_tasks=False,
                can_delete_tasks=False,
                can_manage_members=False
            )