from projects.models import ProjectRole

def user_has_permission(user, project, permission_codename):
    """Check if the user has the specified permission for a given project."""
    project_roles = ProjectRole.objects.filter(user=user, project=project)

    for project_role in project_roles:
        if project_role.role.permissions.filter(codename=permission_codename).exists():
            return True
    return False

def user_has_project_role(user, project, role_name):
    return ProjectRole.objects.filter(user=user, project=project, role__name=role_name).exists()

