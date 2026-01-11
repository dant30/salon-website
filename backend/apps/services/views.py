from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceCategory, Service, ServiceImage
from .serializers import (
    ServiceCategorySerializer,
    ServiceSerializer,
    ServiceListSerializer,
    ServiceImageSerializer,
)
from .filters import ServiceFilter


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True).select_related('category')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServiceFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['display_order', 'name', 'price', 'created_at']
    ordering = ['display_order', 'name']
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category slug if provided
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter popular services
        popular = self.request.query_params.get('popular')
        if popular and popular.lower() == 'true':
            queryset = queryset.filter(is_popular=True)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceListSerializer
        return ServiceSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'])
    def categories_with_services(self, request):
        """Get all categories with their active services."""
        categories = ServiceCategory.objects.filter(is_active=True).prefetch_related(
            'services'
        ).order_by('display_order')
        
        data = []
        for category in categories:
            services = category.services.filter(is_active=True)
            category_data = ServiceCategorySerializer(category).data
            category_data['services'] = ServiceListSerializer(services, many=True).data
            data.append(category_data)
        
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related services (same category)."""
        service = self.get_object()
        related_services = Service.objects.filter(
            category=service.category,
            is_active=True
        ).exclude(id=service.id)[:6]
        
        serializer = ServiceListSerializer(related_services, many=True)
        return Response(serializer.data)


class ServiceImageViewSet(viewsets.ModelViewSet):
    queryset = ServiceImage.objects.all()
    serializer_class = ServiceImageSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        service_slug = self.request.query_params.get('service')
        if service_slug:
            return self.queryset.filter(service__slug=service_slug)
        return self.queryset