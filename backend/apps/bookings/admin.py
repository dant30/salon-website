from django.contrib import admin
from .models import Appointment, Payment, Review, CancellationPolicy


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ['payment_date']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'client', 'service', 'staff', 'appointment_date', 'start_time',
        'status', 'payment_status', 'total_amount', 'is_upcoming'
    ]
    list_filter = ['status', 'payment_status', 'appointment_date', 'staff', 'service']
    search_fields = [
        'client__email', 'client__first_name', 'client__last_name',
        'service__name', 'staff__user__first_name', 'staff__user__last_name'
    ]
    readonly_fields = ['created_at', 'updated_at', 'cancelled_at', 'completed_at']
    ordering = ['-appointment_date', '-start_time']
    inlines = [PaymentInline]
    
    fieldsets = (
        ('Appointment Details', {
            'fields': ('client', 'staff', 'service', 'appointment_date', 'start_time', 'end_time')
        }),
        ('Status & Payment', {
            'fields': ('status', 'payment_status', 'service_price', 'discount_amount',
                      'tax_amount', 'total_amount', 'amount_paid')
        }),
        ('Additional Information', {
            'fields': ('notes', 'special_requests', 'cancellation_reason')
        }),
        ('System Information', {
            'fields': ('reminder_sent', 'confirmation_sent', 'created_at', 'updated_at',
                      'cancelled_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_upcoming(self, obj):
        return obj.is_upcoming
    is_upcoming.boolean = True
    is_upcoming.short_description = 'Upcoming'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'amount', 'payment_method', 'payment_date', 'is_refunded']
    list_filter = ['payment_method', 'is_refunded', 'payment_date']
    search_fields = ['appointment__client__email', 'transaction_id']
    readonly_fields = ['payment_date']
    ordering = ['-payment_date']
    
    fieldsets = (
        ('Payment Details', {
            'fields': ('appointment', 'amount', 'payment_method', 'transaction_id')
        }),
        ('Refund Information', {
            'fields': ('is_refunded', 'refund_date', 'refund_amount', 'notes')
        }),
        ('System Information', {
            'fields': ('payment_date',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'rating', 'client_name', 'service_name', 'is_featured', 'is_approved']
    list_filter = ['rating', 'is_featured', 'is_approved', 'created_at']
    search_fields = ['appointment__client__email', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Review Details', {
            'fields': ('appointment', 'rating', 'comment', 'staff_rating', 'service_rating')
        }),
        ('Moderation', {
            'fields': ('is_featured', 'is_approved')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def client_name(self, obj):
        return obj.client_name
    client_name.short_description = 'Client'
    
    def service_name(self, obj):
        return obj.service_name
    service_name.short_description = 'Service'


@admin.register(CancellationPolicy)
class CancellationPolicyAdmin(admin.ModelAdmin):
    list_display = ['name', 'hours_before', 'penalty_percentage', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['hours_before']
    
    fieldsets = (
        ('Policy Details', {
            'fields': ('name', 'hours_before', 'penalty_percentage', 'is_active')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )