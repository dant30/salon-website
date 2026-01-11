from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, StaffServiceViewSet, StaffAvailabilityViewSet, StaffPreferenceViewSet

router = DefaultRouter()
router.register(r'preferences', StaffPreferenceViewSet, basename='staffpreference')
router.register(r'availabilities', StaffAvailabilityViewSet, basename='availability')
router.register(r'services', StaffServiceViewSet, basename='staffservice')
router.register(r'', StaffViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
]