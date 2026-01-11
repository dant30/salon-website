from django.contrib import admin
from .models import Staff, StaffService, StaffAvailability, StaffPreference


class StaffServiceInline(admin.TabularInline):
    model = StaffService
    extra = 1


class StaffAvailabilityInline(admin.TabularInline):
    model = StaffAvailability
    extra = 1


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'title', 'is_active', 'experience_years', 'display_order']
    list_filter = ['is_active', 'specialization']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'title']
    ordering = ['display_order']
    filter_horizontal = ['specialization']
    inlines = [StaffServiceInline, StaffAvailabilityInline]
    
    def get_full_name(self, obj):
        return obj.full_name
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'user__first_name'
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'title', 'bio', 'photo')
        }),
        ('Professional Details', {
            'fields': ('specialization', 'experience_years', 'is_active', 'display_order')
        }),
        ('Contact Information', {
            'fields': ('phone', 'instagram', 'facebook', 'twitter')
        }),
        ('Working Hours', {
            'fields': ('working_hours',)
        }),
    )


@admin.register(StaffService)
class StaffServiceAdmin(admin.ModelAdmin):
    list_display = ['staff', 'service', 'custom_price', 'final_price', 'is_available']
    list_filter = ['is_available', 'staff', 'service']
    search_fields = ['staff__user__first_name', 'staff__user__last_name', 'service__name']
    list_select_related = ['staff', 'service']


@admin.register(StaffAvailability)
class StaffAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['staff', 'date', 'start_time', 'end_time', 'is_available', 'reason']
    list_filter = ['staff', 'date', 'is_available']
    search_fields = ['staff__user__first_name', 'staff__user__last_name', 'reason']
    ordering = ['date', 'start_time']


@admin.register(StaffPreference)
class StaffPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'staff', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['user__email', 'staff__user__first_name', 'staff__user__last_name']
    ordering = ['-created_at']
    raw_id_fields = ('user', 'staff')