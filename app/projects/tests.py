from django.test import TestCase, Client
from django.urls import reverse
from django.conf import settings
from .models import Project, Task
from .forms import ProjectForm, TaskForm

class CreateProjectAndTasksViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = settings.AUTH_USER_MODEL.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')

    def test_create_project_and_task(self):
        project_data = {
            'name': 'Test Project',
            'description': 'Test Project Description',
            'add_tasks': True,
        }
        task_data = {
            'title': 'Test Task',
            'description': 'Test Task Description',
        }
        response = self.client.post(reverse('projects:create_project_and_tasks'), {**project_data, **task_data})
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Project.objects.filter(name='Test Project').exists())
        self.assertTrue(Task.objects.filter(title='Test Task').exists())

    def test_create_project_and_add_another_task(self):
        project_data = {
            'name': 'Test Project',
            'description': 'Test Project Description',
            'add_tasks': True,
        }
        task_data = {
            'title': 'Test Task',
            'description': 'Test Task Description',
        }
        response = self.client.post(reverse('projects:create_project_and_tasks'), {**project_data, **task_data, 'save_add_another': True})
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Project.objects.filter(name='Test Project').exists())
        self.assertTrue(Task.objects.filter(title='Test Task').exists())
        self.assertRedirects(response, reverse('projects:create_project_and_tasks', kwargs={'project_id': Project.objects.get(name='Test Project').id}))

    def test_invalid_project_form(self):
        project_data = {
            'name': '',
            'description': 'Test Project Description',
            'add_tasks': True,
        }
        response = self.client.post(reverse('projects:create_project_and_tasks'), project_data)
        self.assertEqual(response.status_code, 200)
        self.assertFormError(response.context['project_form'], 'name', 'This field is required.')

    def test_invalid_task_form(self):
        project_data = {
            'name': 'Test Project',
            'description': 'Test Project Description',
            'add_tasks': True,
        }
        task_data = {
            'title': '',
            'description': 'Test Task Description',
        }
        response = self.client.post(reverse('projects:create_project_and_tasks'), {**project_data, **task_data})
        self.assertEqual(response.status_code, 200)
        self.assertFormError(response.context['task_form'], 'title', 'This field is required.')

