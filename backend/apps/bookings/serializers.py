from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, Payment, Review, CancellationPolicy
from apps.users.serializers import UserSerializer
from apps.staff.serializers import StaffListSerializer
from apps.services.serializers import ServiceSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.client.field.related_model.objects.all(),
        source='client',
        write_only=True,
        required=False
    )
    staff = StaffListSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.staff.field.related_model.objects.filter(is_active=True),
        source='staff',
        write_only=True
    )
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.service.field.related_model.objects.filter(is_active=True),
        source='service',
        write_only=True
    )
    is_upcoming = serializers.BooleanField(read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    balance_due = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'client_id', 'staff', 'staff_id', 'service', 'service_id',
            'appointment_date', 'start_time', 'end_time', 'status', 'payment_status',
            'service_price', 'discount_amount', 'tax_amount', 'total_amount',
            'amount_paid', 'balance_due', 'notes', 'special_requests',
            'cancellation_reason', 'is_upcoming', 'duration_minutes',
            'reminder_sent', 'confirmation_sent', 'created_at', 'updated_at',
            'cancelled_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'is_upcoming', 'duration_minutes', 'balance_due',
            'reminder_sent', 'confirmation_sent', 'created_at', 'updated_at',
            'cancelled_at', 'completed_at'
        ]
    
    def validate(self, data):
        # Validate appointment date is not in the past
        appointment_date = data.get('appointment_date')
        start_time = data.get('start_time')
        
        if appointment_date and start_time:
            appointment_datetime = datetime.combine(appointment_date, start_time)
            if appointment_datetime < timezone.now():
                raise serializers.ValidationError(
                    "Appointment date and time cannot be in the past"
                )
        
        # Validate staff is available at that time
        staff = data.get('staff')
        if staff and appointment_date and start_time and data.get('end_time'):
            end_time = data.get('end_time')
            
            # Check for overlapping appointments
            overlapping = Appointment.objects.filter(
                staff=staff,
                appointment_date=appointment_date,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            )
            
            if self.instance:
                overlapping = overlapping.exclude(id=self.instance.id)
            
            if overlapping.exists():
                raise serializers.ValidationError(
                    "Staff member is not available at this time"
                )
        
        return data
    
    def create(self, validated_data):
        # Set client to current user if not provided
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if 'client' not in validated_data:
                validated_data['client'] = request.user
        
        # Set service price from service
        service = validated_data.get('service')
        if service and 'service_price' not in validated_data:
            validated_data['service_price'] = service.final_price
        
        return super().create(validated_data)


class AppointmentCreateSerializer(serializers.ModelSerializer):
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.staff.field.related_model.objects.filter(is_active=True),
        source='staff',
        write_only=True
    )
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.service.field.related_model.objects.filter(is_active=True),
        source='service',
        write_only=True
    )
    
    class Meta:
        model = Appointment
        fields = [
            'staff_id', 'service_id', 'appointment_date', 'start_time',
            'notes', 'special_requests'
        ]
    
    def validate(self, data):
        return AppointmentSerializer.validate(self, data)


class PaymentSerializer(serializers.ModelSerializer):
    appointment = serializers.PrimaryKeyRelatedField(queryset=Appointment.objects.all())
    
    class Meta:
        model = Payment
        fields = [
            'id', 'appointment', 'amount', 'payment_method',
            'transaction_id', 'payment_date', 'notes',
            'is_refunded', 'refund_date', 'refund_amount'
        ]
        read_only_fields = ['id', 'payment_date']
    
    def validate(self, data):
        appointment = data.get('appointment')
        amount = data.get('amount')
        
        if appointment and amount:
            if amount <= 0:
                raise serializers.ValidationError("Payment amount must be greater than zero")
            
            # Check if payment exceeds balance due
            if amount > appointment.balance_due:
                raise serializers.ValidationError(
                    f"Payment amount exceeds balance due. Balance: {appointment.balance_due}"
                )
        
        return data


class ReviewSerializer(serializers.ModelSerializer):
    appointment = serializers.PrimaryKeyRelatedField(queryset=Appointment.objects.all())
    client_name = serializers.CharField(read_only=True)
    service_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'appointment', 'rating', 'comment',
            'staff_rating', 'service_rating', 'is_featured',
            'is_approved', 'client_name', 'service_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'client_name', 'service_name', 'created_at', 'updated_at']
    
    def validate(self, data):
        appointment = data.get('appointment')
        
        if appointment:
            # Check if appointment is completed
            if appointment.status != 'completed':
                raise serializers.ValidationError("You can only review completed appointments")
            
            # Check if review already exists
            if Review.objects.filter(appointment=appointment).exists():
                if not self.instance:
                    raise serializers.ValidationError("Review already exists for this appointment")
        
        return data


class CancellationPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = CancellationPolicy
        fields = [
            'id', 'name', 'hours_before', 'penalty_percentage',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AvailabilityCheckSerializer(serializers.Serializer):
    staff_id = serializers.IntegerField(required=True)
    date = serializers.DateField(required=True)
    service_id = serializers.IntegerField(required=True)
    
    def validate(self, data):
        from apps.staff.models import Staff
        from apps.services.models import Service
        
        # Check if staff exists
        try:
            staff = Staff.objects.get(id=data['staff_id'], is_active=True)
        except Staff.DoesNotExist:
            raise serializers.ValidationError({"staff_id": "Staff member not found or inactive"})
        
        # Check if service exists
        try:
            service = Service.objects.get(id=data['service_id'], is_active=True)
        except Service.DoesNotExist:
            raise serializers.ValidationError({"service_id": "Service not found or inactive"})
        
        # Check if staff can perform this service
        if not staff.staff_services.filter(service_id=data['service_id'], is_available=True).exists():
            raise serializers.ValidationError({"service_id": "This staff member does not perform this service"})
        
        data['staff'] = staff
        data['service'] = service
        return data


class TimeSlotSerializer(serializers.Serializer):
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    is_available = serializers.BooleanField()