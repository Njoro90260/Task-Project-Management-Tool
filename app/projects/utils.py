from .models import ProjectRole

def user_has_permission(user, project, permission_codename):
    """Check if the user has the specified permission for a given project."""
    project_roles = ProjectRole.objects.filter(user=user, project=project)

    for project_role in project_roles:
        if hasattr(project_role, "permissions") and project_role.permissions:
            if permission_codename == "can_manage_members" and project_role.permissions.can_manage_members:
                return True
            if permission_codename == "can_create_tasks" and project_role.permissions.can_create_tasks:
                return True
            if permission_codename == "can_edit_tasks" and project_role.permissions.can_edit_tasks:
                return True
            if permission_codename == "can_delete_tasks" and project_role.permissions.can_delete_tasks:
                return True
            if permission_codename == "can_delete_files" and project_role.permissions.can_delete_files:
                return True

    return False


def user_has_project_role(user, project, role_name):
    return ProjectRole.objects.filter(user=user, project=project, role__name=role_name).exists()

