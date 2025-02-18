# Generated by Django 5.1.5 on 2025-01-24 12:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Feature',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text="Short title of the feature, e.g., 'Task Management'", max_length=100)),
                ('description', models.TextField(help_text='Detailed description of the feature')),
                ('icon', models.CharField(blank=True, help_text="Font Awesome or custom icon class for feature display (e'g', 'fas fa-tasks)", max_length=50, null=True)),
                ('is_active', models.BooleanField(default=True, help_text='Display this on the homepage?')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Feature',
                'verbose_name_plural': 'Features',
                'ordering': ['title'],
            },
        ),
    ]
