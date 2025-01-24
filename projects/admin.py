from django.contrib import admin
from django.apps import apps

# Register your models here.
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')
    fields = ('title', 'description', 'svg_icon', 'icon_file', 'is_active')


app = apps.get_app_config('projects')

for model in app.get_models():
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
