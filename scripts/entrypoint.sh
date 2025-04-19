#!/bin/sh
set -e

echo "Entrypoint script running..."

# Validate secret key
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "default-dev-secret-key" ] || [ "$SECRET_KEY" = "must-be-set-for-production" ]; then
    echo "ERROR: SECRET_KEY must be properly configured"
    echo "For production, set it in your environment variables or .env.prod file"
    echo "For development, you can use the default in .env file"
    exit 1
fi

cd /app

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

if [ "$CREATE_SUPERUSER" = "true" ]; then
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
    echo "Superuser creation skipped."
fi

# Determine server type based on environment variable
if [ "$SERVER_TYPE" = "uwsgi" ]; then
    echo "Starting uWSGI server (development mode with Nginx)..."
    uwsgi --http :8000 \
      --master \
      --enable-threads \
      --module project_management.wsgi \
      --buffer-size 32768 \
      --http-timeout 300 \
      --static-safe /static=/vol/static \
      --static-safe /media=/vol/media
else
    echo "Starting Gunicorn server (production mode)..."
    exec gunicorn project_management.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --worker-class sync \
        --timeout 120 \
        --log-level info \
        --access-logfile - \
        --error-logfile -
fi