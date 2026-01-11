from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, date, timedelta
from .models import Appointment, Payment, Review, CancellationPolicy
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    PaymentSerializer,
    ReviewSerializer,
    CancellationPolicySerializer,
    AvailabilityCheckSerializer,
    TimeSlotSerializer,
)
from apps.users.permissions import IsOwnerOrReadOnly, IsClient
from utils.email_service import (
    send_appointment_confirmation,
    send_appointment_reminder,
    send_appointment_cancellation,
    send_staff_notification,
)
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum
from django.contrib.auth import get_user_model
from apps.services.models import Service


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().select_related('client', 'staff', 'service')
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_status', 'staff', 'service', 'appointment_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_staff_member:
            return self.queryset
        return self.queryset.filter(client=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        appointment = serializer.save()
        send_appointment_confirmation(appointment)
        send_staff_notification(appointment, 'created')

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        reason = request.data.get('reason', '')
        appointment.status = 'cancelled'
        appointment.cancellation_reason = reason
        appointment.cancelled_at = datetime.now()
        appointment.save()
        send_appointment_cancellation(appointment, reason)
        send_staff_notification(appointment, 'cancelled')
        return Response({'status': 'Appointment cancelled'})

    @action(detail=False, methods=['get'])
    def availability(self, request):
        serializer = AvailabilityCheckSerializer(data=request.query_params)
        if serializer.is_valid():
            staff = serializer.validated_data['staff']
            service = serializer.validated_data['service']
            date_param = request.query_params.get('date')
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date() if date_param else date.today()

            # Get staff availability and existing appointments
            availabilities = staff.availabilities.filter(date=target_date, is_available=True)
            existing_appointments = Appointment.objects.filter(
                staff=staff, appointment_date=target_date, status__in=['pending', 'confirmed']
            )

            # Generate time slots
            slots = []
            for avail in availabilities:
                current_time = avail.start_time
                while current_time < avail.end_time:
                    end_slot = (datetime.combine(target_date, current_time) + timedelta(minutes=service.duration)).time()
                    if end_slot <= avail.end_time:
                        # Check if slot is free
                        conflicting = existing_appointments.filter(
                            Q(start_time__lt=end_slot) & Q(end_time__gt=current_time)
                        )
                        slots.append({
                            'start_time': current_time,
                            'end_time': end_slot,
                            'is_available': not conflicting.exists()
                        })
                    current_time = end_slot

            return Response(slots)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('appointment')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(appointment__client=user)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('appointment')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(appointment__client=user)

    def perform_create(self, serializer):
        serializer.save()


class CancellationPolicyViewSet(viewsets.ModelViewSet):
    queryset = CancellationPolicy.objects.filter(is_active=True)
    serializer_class = CancellationPolicySerializer
    permission_classes = [permissions.IsAdminUser]


class AvailabilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Appointment.objects.none()  # Not used directly
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def check(self, request):
        serializer = AvailabilityCheckSerializer(data=request.query_params)
        if serializer.is_valid():
            # Reuse logic from AppointmentViewSet.availability
            return AppointmentViewSet().availability(request)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    """
    Simple dashboard stats endpoint used by the frontend.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        today = timezone.localdate()
        appointments_today = Appointment.objects.filter(
            appointment_date=today, status__in=['pending', 'confirmed']
        ).count()
        upcoming = Appointment.objects.filter(
            appointment_date__gte=today, status__in=['pending', 'confirmed']
        ).count()
        total_clients = get_user_model().objects.count()
        total_services = Service.objects.filter(is_active=True).count()
        revenue_today = Payment.objects.filter(payment_date__date=today).aggregate(total=Sum('amount'))['total'] or 0

        stats = [
            {'label': "Today's Appointments", 'value': appointments_today, 'color': 'primary'},
            {'label': 'Upcoming Appointments', 'value': upcoming, 'color': 'info'},
            {'label': 'Total Clients', 'value': total_clients, 'color': 'success'},
            {'label': 'Revenue Today', 'value': float(revenue_today), 'color': 'warning'},
        ]
        return Response(stats)