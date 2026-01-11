from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from apps.bookings.views import DashboardStatsView


def api_root(request):
    return JsonResponse({
        'message': 'Virginia Hair Braider API',
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth/',
            'token': '/api/token/',
            'token_refresh': '/api/token/refresh/',
            'services': '/api/services/',
            'staff': '/api/staff/',
            'bookings': '/api/bookings/',
            'gallery': '/api/gallery/',
            'dashboard_stats': '/api/dashboard/stats/',
            'admin': '/admin/',
        },
        'contact': {
            'email': 'berthaajohn151@gmail.com',
            'phone': '(570) 331-1503'
        }
    })


urlpatterns = [
    # API root
    path('', api_root, name='api-root'),

    # Admin
    path('admin/', admin.site.urls),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Dashboard
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # App APIs
    path('api/auth/', include('apps.users.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/gallery/', include('apps.gallery.urls')),
]

# Media files (development only)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
