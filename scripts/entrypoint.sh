#!/bin/sh

set -e

echo "Applying database migrations..."
python manage.py migrate

echo "collecting static files..."

python manage.py collectstatic --noinput

if ["$CREATE_SUPERUSER" = "true"]; then
    echo "Creating superuser..."
    python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}').exists():
    User.objects.create_superuser(
        username='${DJANGO_SUPERUSER_USERNAME}',
        email='${DJANGO_SUPERUSER_EMAIL}',
        password='${DJANGO_SUPERUSER_PASSWORD}'
    )
EOF
else
    echo "Superuser already exists, skipping creation."
fi
    
echo "starting uWSGI server..."
uwsgi --socket :8000 --master --enable-threads --module app.wsgi

