from django import forms
from .models import Project, Task
import datetime


class ProjectForm(forms.ModelForm):
    add_tasks = forms.BooleanField(
        required=False, 
        label='Add tasks?', 
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )

    class Meta:
        model = Project
        fields = ['name', 'project_description', 'deadline', 'add_tasks']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Project Name', 'class': 'form-control custom-input'}),
            'project_description': forms.Textarea(attrs={'placeholder': 'Describe the project...', 'class': 'form-control custom-textarea', 'rows': 4}),
            'deadline': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date', 'class': 'form-control custom-date'}),
        }

    def __init__(self, *args, **kwargs):
        super(ProjectForm, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name != 'add_tasks':  # Skip modifying checkbox styling
                field.widget.attrs['class'] += ' shadow-sm rounded'


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
            'project': forms.Select(attrs={'class': 'form-control custom-select'}),
            'assigned_to': forms.Select(attrs={'class': 'form-control custom-select'}),
            'title': forms.TextInput(attrs={'placeholder': 'Enter Task Title', 'class': 'form-control custom-input'}),
            'task_description': forms.Textarea(attrs={'placeholder': 'Describe the task...', 'class': 'form-control custom-textarea', 'rows': 4}),
            'status': forms.Select(attrs={'class': 'form-control custom-select'}),
            'priority': forms.Select(attrs={'class': 'form-control custom-select'}),
            'start_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date', 'class': 'form-control custom-date'}),
            'due_date': forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date', 'class': 'form-control custom-date'}),
        }



    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] += 'shadow-sm rounded'

        if user:
            self.fields['project'].queryset = Project.objects.filter(members=user)

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        due_date = cleaned_data.get('due_date')

        if start_date and due_date and start_date > due_date:
            raise forms.ValidationError('Start date cannot be later than due date.')

        return cleaned_data