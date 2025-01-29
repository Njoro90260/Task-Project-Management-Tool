from django import forms
from .models import Project, Task
import datetime

class ProjectForm(forms.ModelForm):
    add_tasks = forms.BooleanField(required=False, label='Add tasks?')
    
    class Meta:
        model = Project
        fields = ['name', 'project_description', 'deadline', 'add_tasks']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Project Name', 'class': 'form-control', 'size': 80}),
            'project_description': forms.Textarea(attrs={'placeholder': 'Describe the project...', 'class': 'form-control', 'rows': 4}),
            'deadline': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        }

    def clean_deadline(self):
        deadline = self.cleaned_data.get('deadline')
        if deadline and deadline < datetime.date.today():
            raise forms.ValidationError('Deadline cannot be in the past.')
        return deadline

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['project', 'assigned_to', 'title', 'task_description', 'status', 'priority', 'start_date', 'due_date']
        widgets = {
            'project': forms.Select(attrs={'class': 'form-control'}),
            'assigned_to': forms.Select(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'placeholder': 'Task Title', 'class': 'form-control'}),
            'task_description': forms.Textarea(attrs={'placeholder': 'Describe the task...', 'class': 'form-control', 'rows': 4}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'priority': forms.Select(attrs={'class': 'form-control'}),
            'start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'due_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        due_date = cleaned_data.get('due_date')

        if start_date and due_date and start_date > due_date:
            raise forms.ValidationError('Start date cannot be later than due date.')

        return cleaned_data