from django import forms
from .models import Project

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['name', 'description', 'deadline']
        widgets = {
            'name': forms.TextInput(attrs={'size': 80}),
            'description': forms.Textarea(attrs={'cols': 80}),
            'deadline': forms.DateInput(attrs={'size': 80}),
        }
        