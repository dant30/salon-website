from django.contrib import admin
from .models import ServiceCategory, Service, ServiceImage


class ServiceImageInline(admin.TabularInline):
    model = ServiceImage
    extra = 1


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['display_order']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'duration', 'price', 'final_price', 'is_popular', 'is_active']
    list_filter = ['category', 'is_popular', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['display_order', 'name']
    prepopulated_fields = {'slug': ['name']}
    inlines = [ServiceImageInline]
    readonly_fields = ['final_price', 'discount_percentage']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'slug', 'description')
        }),
        ('Pricing & Duration', {
            'fields': ('duration', 'price', 'discounted_price', 'final_price', 'discount_percentage')
        }),
        ('Display & Images', {
            'fields': ('image', 'is_popular', 'is_active', 'display_order')
        }),
    )


@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ['service', 'caption', 'display_order']
    list_filter = ['service']
    ordering = ['service', 'display_order']