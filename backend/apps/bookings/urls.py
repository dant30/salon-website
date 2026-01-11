from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet,
    PaymentViewSet,
    ReviewViewSet,
    CancellationPolicyViewSet,
    AvailabilityViewSet,
)

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'cancellation-policies', CancellationPolicyViewSet, basename='cancellationpolicy')
router.register(r'availability', AvailabilityViewSet, basename='availability')

urlpatterns = [
    path('', include(router.urls)),
]