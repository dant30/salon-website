from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Staff, StaffService, StaffAvailability, StaffPreference
from apps.services.serializers import ServiceSerializer

User = get_user_model()


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class StaffPreferenceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    
    class Meta:
        model = StaffPreference
        fields = ['id', 'staff', 'staff_name', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']


class StaffSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    specialization = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Staff.objects.none(),
        required=False
    )
    
    class Meta:
        model = Staff
        fields = [
            'id', 'user', 'full_name', 'title', 'bio', 'specialization',
            'experience_years', 'photo', 'phone', 'is_active', 'display_order',
            'instagram', 'facebook', 'twitter', 'working_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['specialization'].queryset = Staff.specialization.field.related_model.objects.all()


class StaffListSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    specialization = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        read_only=True
    )
    
    class Meta:
        model = Staff
        fields = [
            'id', 'user', 'full_name', 'title', 'bio', 'specialization',
            'experience_years', 'photo', 'is_active'
        ]


class StaffServiceSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=StaffService.service.field.related_model.objects.all(),
        source='service',
        write_only=True
    )
    staff = StaffListSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.all(),
        source='staff',
        write_only=True
    )
    final_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    
    class Meta:
        model = StaffService
        fields = [
            'id', 'staff', 'staff_id', 'service', 'service_id',
            'custom_price', 'final_price', 'is_available', 'notes'
        ]
        read_only_fields = ['id', 'final_price']


class StaffAvailabilitySerializer(serializers.ModelSerializer):
    staff = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all())
    
    class Meta:
        model = StaffAvailability
        fields = [
            'id', 'staff', 'date', 'start_time', 'end_time',
            'is_available', 'reason'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError(
                "Start time must be before end time"
            )
        
        if self.instance:
            overlapping = StaffAvailability.objects.filter(
                staff=data['staff'],
                date=data['date'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time']
            ).exclude(id=self.instance.id)
        else:
            overlapping = StaffAvailability.objects.filter(
                staff=data['staff'],
                date=data['date'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time']
            )
        
        if overlapping.exists():
            raise serializers.ValidationError(
                "This time slot overlaps with existing availability"
            )
        
        return data


class StaffWithServicesSerializer(StaffSerializer):
    staff_services = StaffServiceSerializer(many=True, read_only=True)
    
    class Meta(StaffSerializer.Meta):
        fields = StaffSerializer.Meta.fields + ['staff_services']