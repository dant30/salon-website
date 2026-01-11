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

echo "Checking for superuser creation..."
# Only create superuser if environment variables are set
if [[ -n "$SUPERUSER_EMAIL" && -n "$SUPERUSER_PASSWORD" ]]; then
    echo "Creating superuser from environment variables..."
    python << END
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'salon.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

SUPERUSER_EMAIL = os.environ['SUPERUSER_EMAIL']
SUPERUSER_PASSWORD = os.environ['SUPERUSER_PASSWORD']

if not User.objects.filter(email=SUPERUSER_EMAIL).exists():
    print(f"Creating superuser: {SUPERUSER_EMAIL}")
    User.objects.create_superuser(
        email=SUPERUSER_EMAIL,
        password=SUPERUSER_PASSWORD,
        first_name='Admin',
        last_name='User',
        phone='(570) 331-1503',
        is_staff_member=True
    )
    print("Superuser created successfully!")
else:
    print(f"Superuser {SUPERUSER_EMAIL} already exists.")
END
else
    echo "Superuser environment variables not set. Skipping superuser creation."
    echo "To create a superuser, set SUPERUSER_EMAIL and SUPERUSER_PASSWORD environment variables."
fi

echo "Build complete!"