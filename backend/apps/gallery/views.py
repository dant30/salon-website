from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import GalleryCategory, GalleryImage, GalleryVideo, Testimonial
from .serializers import (
    GalleryCategorySerializer,
    GalleryImageSerializer,
    GalleryImageListSerializer,
    GalleryVideoSerializer,
    TestimonialSerializer,
    TestimonialListSerializer,
)
from .filters import GalleryImageFilter


class GalleryCategoryViewSet(viewsets.ModelViewSet):
    queryset = GalleryCategory.objects.filter(is_active=True)
    serializer_class = GalleryCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.filter(is_active=True).select_related(
        'category', 'service', 'staff__user'
    )
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = GalleryImageFilter
    search_fields = ['title', 'description', 'tags', 'category__name']
    ordering_fields = ['display_order', 'created_at', 'views', 'likes']
    ordering = ['display_order', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return GalleryImageListSerializer
        return GalleryImageSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'like']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def increment_views(self, request, pk=None):
        """Increment view count for an image."""
        image = self.get_object()
        image.increment_views()
        return Response({'views': image.views})
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like an image."""
        image = self.get_object()
        image.increment_likes()
        return Response({'likes': image.likes})
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured gallery images."""
        images = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(images)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def before_after(self, request):
        """Get before/after transformation images."""
        images = self.get_queryset().filter(image_type='before_after')
        page = self.paginate_queryset(images)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_service(self, request):
        """Get gallery images for a specific service."""
        service_id = request.query_params.get('service_id')
        service_slug = request.query_params.get('service_slug')
        
        if not (service_id or service_slug):
            return Response(
                {"error": "Provide either service_id or service_slug parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.services.models import Service
        
        try:
            if service_id:
                service = Service.objects.get(id=service_id, is_active=True)
            else:
                service = Service.objects.get(slug=service_slug, is_active=True)
        except Service.DoesNotExist:
            return Response(
                {"error": "Service not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        images = self.get_queryset().filter(service=service)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_staff(self, request):
        """Get gallery images for a specific staff member."""
        staff_id = request.query_params.get('staff_id')
        
        if not staff_id:
            return Response(
                {"error": "staff_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.staff.models import Staff
        
        try:
            staff = Staff.objects.get(id=staff_id, is_active=True)
        except Staff.DoesNotExist:
            return Response(
                {"error": "Staff member not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        images = self.get_queryset().filter(staff=staff)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)


class GalleryVideoViewSet(viewsets.ModelViewSet):
    queryset = GalleryVideo.objects.filter(is_active=True).select_related(
        'category', 'service'
    )
    serializer_class = GalleryVideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'description']
    ordering_fields = ['display_order', 'created_at', 'views']
    ordering = ['display_order', '-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def increment_views(self, request, pk=None):
        """Increment view count for a video."""
        video = self.get_object()
        video.increment_views()
        return Response({'views': video.views})
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured gallery videos."""
        videos = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(videos)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.filter(is_approved=True).select_related(
        'client', 'service', 'staff__user'
    )
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rating', 'is_featured', 'service', 'staff']
    search_fields = ['content', 'client_name', 'client__first_name', 'client__last_name']
    ordering_fields = ['display_order', 'created_at', 'rating']
    ordering = ['display_order', '-created_at']
    
    def get_queryset(self):
        # Admins can see all testimonials
        if self.request.user.is_staff:
            return Testimonial.objects.all().select_related(
                'client', 'service', 'staff__user'
            )
        
        return super().get_queryset()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TestimonialListSerializer
        return TestimonialSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured testimonials."""
        testimonials = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(testimonials)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(testimonials, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Submit a new testimonial (requires client authentication)."""
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to submit testimonials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user has completed appointments
        from apps.bookings.models import Appointment
        
        completed_appointments = Appointment.objects.filter(
            client=request.user,
            status='completed'
        ).exists()
        
        if not completed_appointments:
            return Response(
                {"error": "You must have completed appointments to submit a testimonial"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-approve for staff/admin, otherwise require approval
        data = request.data.copy()
        data['client'] = request.user.id
        
        if request.user.is_staff or request.user.is_staff_member:
            data['is_approved'] = True
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)