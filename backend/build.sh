#!/usr/bin/env bash
# build.sh

set -o errexit

echo "========================================"
echo "Virginia Hair Braider - Build Process"
echo "========================================"

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "🔄 Running database migrations..."
python manage.py migrate --noinput

echo "📊 Populating initial data..."
python manage.py populate_services
python manage.py populate_staff
python manage.py populate_gallery
python manage.py populate_policies

echo "👤 Checking for superuser..."
if [[ -n "${SUPERUSER_EMAIL:-}" && -n "${SUPERUSER_PASSWORD:-}" ]]; then
    echo "  Attempting superuser creation: ${SUPERUSER_EMAIL}"

    python << END
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'salon.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = os.environ['SUPERUSER_EMAIL']
password = os.environ['SUPERUSER_PASSWORD']

try:
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
            phone='(570) 331-1503',
            is_staff_member=True
        )
        print(f"    ✅ Superuser {email} created successfully!")
    else:
        print(f"    ⚠️ Superuser {email} already exists.")
except Exception as e:
    print(f"    ❌ Error creating superuser: {str(e)}")
    sys.exit(1)
END

else
    echo "  ⚠️ SUPERUSER_EMAIL or SUPERUSER_PASSWORD not set — skipping."
fi

echo ""
echo "✅ Build complete!"
echo "========================================"
echo "🌐 Backend URL:  https://salon-backend-hl61.onrender.com"
echo "👁️ Admin Panel: https://salon-backend-hl61.onrender.com/admin/"
echo "💅 Frontend:    https://salon-frontend-4pst.onrender.com"
echo "========================================"
