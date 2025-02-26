from django import forms
from .models import TaskFile

class TaskFileUploadFrom(forms.ModelForm):
    class Meta:
        model = TaskFile
        fields = ["file"]
        