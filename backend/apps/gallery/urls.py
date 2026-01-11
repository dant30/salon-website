from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GalleryCategoryViewSet,
    GalleryImageViewSet,
    GalleryVideoViewSet,
    TestimonialViewSet,
)

router = DefaultRouter()
router.register(r'categories', GalleryCategoryViewSet, basename='gallerycategory')
router.register(r'images', GalleryImageViewSet, basename='galleryimage')
router.register(r'videos', GalleryVideoViewSet, basename='galleryvideo')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')

urlpatterns = [
    path('', include(router.urls)),
]