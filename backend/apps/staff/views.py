from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from datetime import datetime, date
from .models import Staff, StaffService, StaffAvailability, StaffPreference
from .serializers import (
    StaffSerializer,
    StaffListSerializer,
    StaffServiceSerializer,
    StaffAvailabilitySerializer,
    StaffWithServicesSerializer,
    StaffPreferenceSerializer,
)
from apps.services.models import Service
from apps.users.permissions import IsOwnerOrReadOnly


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.filter(is_active=True).select_related('user')
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'title', 'bio']
    ordering_fields = ['display_order', 'user__first_name', 'experience_years']
    ordering = ['display_order']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StaffListSerializer
        elif self.action == 'with_services':
            return StaffWithServicesSerializer
        return StaffSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def services(self, request, pk=None):
        """Get all services this staff member can perform."""
        staff = self.get_object()
        services = staff.staff_services.filter(is_available=True).select_related('service')
        serializer = StaffServiceSerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get staff member's availability for a specific date."""
        staff = self.get_object()
        date_param = request.query_params.get('date')
        
        if not date_param:
            return Response(
                {"error": "date parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        availabilities = staff.availabilities.filter(date=target_date, is_available=True)
        serializer = StaffAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def with_services(self, request):
        """Get all staff members with their services."""
        staff = Staff.objects.filter(is_active=True).prefetch_related(
            Prefetch(
                'staff_services',
                queryset=StaffService.objects.filter(is_available=True).select_related('service')
            )
        ).order_by('display_order')
        
        serializer = StaffWithServicesSerializer(staff, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_service(self, request):
        """Get staff members who can perform a specific service."""
        service_id = request.query_params.get('service_id')
        service_slug = request.query_params.get('service_slug')
        
        if not (service_id or service_slug):
            return Response(
                {"error": "Provide either service_id or service_slug parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if service_id:
                service = Service.objects.get(id=service_id)
            else:
                service = Service.objects.get(slug=service_slug)
        except Service.DoesNotExist:
            return Response(
                {"error": "Service not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        staff_services = StaffService.objects.filter(
            service=service,
            is_available=True
        ).select_related('staff__user')
        
        staff_ids = [ss.staff.id for ss in staff_services]
        staff = Staff.objects.filter(
            id__in=staff_ids,
            is_active=True
        ).order_by('display_order')
        
        serializer = StaffListSerializer(staff, many=True)
        return Response(serializer.data)


class StaffServiceViewSet(viewsets.ModelViewSet):
    queryset = StaffService.objects.all().select_related('staff', 'service')
    serializer_class = StaffServiceSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        staff_id = self.request.query_params.get('staff')
        service_id = self.request.query_params.get('service')
        
        queryset = self.queryset
        
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        
        return queryset


class StaffAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = StaffAvailability.objects.all().select_related('staff')
    serializer_class = StaffAvailabilitySerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        staff_id = self.request.query_params.get('staff')
        date_param = self.request.query_params.get('date')
        is_available = self.request.query_params.get('is_available')
        
        queryset = self.queryset
        
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        if date_param:
            queryset = queryset.filter(date=date_param)
        if is_available:
            queryset = queryset.filter(is_available=(is_available.lower() == 'true'))
        
        return queryset.order_by('date', 'start_time')


class StaffPreferenceViewSet(viewsets.ModelViewSet):
    queryset = StaffPreference.objects.all()  # Add this line
    serializer_class = StaffPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return StaffPreference.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def primary(self, request):
        preference = StaffPreference.objects.filter(
            user=request.user,
            is_primary=True
        ).first()
        
        if not preference:
            return Response(
                {"detail": "No primary stylist set"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(preference)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        preference = self.get_object()
        
        StaffPreference.objects.filter(user=request.user).update(is_primary=False)
        preference.is_primary = True
        preference.save()
        
        serializer = self.get_serializer(preference)
        return Response(serializer.data)