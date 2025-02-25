from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Users"

    def ready(self):
        import Users.signals 
        print("✅ Users app is ready, signals loaded!") # debud print statement
