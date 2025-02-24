from .models import ProjectRole

def user_has_permission(user, project, permission_codename):
    """Check if the user has the specified permission for a given project."""
    project_roles = ProjectRole.objects.filter(user=user, project=project)

    for project_role in project_roles:
        if project_role.permissions: 
            if permission_codename == "delete_task_file" and project_role.permissions.can_delete_files:
                return True  
            if permission_codename == "delete_task" and project_role.permissions.can_delete_tasks:
                return True  

    return False


def user_has_project_role(user, project, role_name):
    return ProjectRole.objects.filter(user=user, project=project, role__name=role_name).exists()

