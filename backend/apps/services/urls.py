from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceCategoryViewSet, ServiceViewSet, ServiceImageViewSet

router = DefaultRouter()
router.register(r'categories', ServiceCategoryViewSet, basename='category')
router.register(r'images', ServiceImageViewSet, basename='serviceimage')
router.register(r'', ServiceViewSet, basename='service')

urlpatterns = [
    path('', include(router.urls)),
]