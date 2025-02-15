from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Users'

    def ready(self):
        import Users.signals
        from Users.models import Role
        for role_name in ['Admin', 'Manager', 'Team Member']:
            Role.objects.get_or_create(name=role_name)
