from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from apps.bookings.views import DashboardStatsView  # added

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Dashboard stats endpoint
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),  # added

    # API routes
    path('api/auth/', include('apps.users.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/gallery/', include('apps.gallery.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)