#!/bin/sh
set -e

# If running as root, setup permissions and drop privileges
if [ "$(id -u)" = "0" ]; then
    echo "🔧 Running as root to setup volumes..."
    mkdir -p /vol/static /vol/media
    chown -R user:user /vol/static /vol/media
    chmod -R 775 /vol/static /vol/media
    
    echo "🔧 Dropping privileges to user..."
    exec gosu user "$0" "$@"
fi

# Normal execution as user continues here
echo "Entrypoint script running as user: $(whoami)"
id

# Validate secret key
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "default-dev-secret-key" ] || [ "$SECRET_KEY" = "must-be-set-for-production" ]; then
    echo "ERROR: SECRET_KEY must be properly configured"
    exit 1
fi

cd /app

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "⚙️ Running Django management commands..."

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser
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

# Start the appropriate server
if [ "$SERVER_TYPE" = "uwsgi" ]; then
    echo "Starting uWSGI server"
    exec uwsgi --http :8000 \
      --master \
      --enable-threads \
      --module project_management.wsgi \
      --buffer-size 32768 \
      --http-timeout 300 \
      --static-safe /static=/vol/static \
      --static-safe /media=/vol/media
else
    echo "Starting Gunicorn server"
    exec gunicorn project_management.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --worker-class sync \
        --timeout 120 \
        --log-level info \
        --access-logfile - \
        --error-logfile -
fi