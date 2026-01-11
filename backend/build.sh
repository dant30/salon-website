#!/usr/bin/env bash
# build.sh

set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Populating initial data..."
python manage.py populate_services
python manage.py populate_staff
python manage.py populate_gallery
python manage.py populate_policies

# Optional: Create superuser (comment out in production)
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@example.com', 'adminpassword') if not User.objects.filter(email='admin@example.com').exists() else None" | python manage.py shell

echo "Build complete!"
