from django.contrib import admin
from .models import GalleryCategory, GalleryImage, GalleryVideo, Testimonial


@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_order', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['display_order']
    
    fieldsets = (
        ('Category Details', {
            'fields': ('name', 'description', 'icon', 'display_order', 'is_active')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'image_type', 'is_featured', 'is_active', 'views', 'likes']
    list_filter = ['category', 'image_type', 'is_featured', 'is_active']
    search_fields = ['title', 'description', 'tags']
    ordering = ['display_order', '-created_at']
    readonly_fields = ['views', 'likes', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Image Details', {
            'fields': ('title', 'description', 'image', 'thumbnail', 'category', 'image_type')
        }),
        ('Before/After Specific', {
            'fields': ('before_image', 'after_image', 'transformation_description'),
            'classes': ('collapse',)
        }),
        ('Tags & Associations', {
            'fields': ('tags', 'service', 'staff')
        }),
        ('Display & Statistics', {
            'fields': ('display_order', 'is_featured', 'is_active', 'views', 'likes')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GalleryVideo)
class GalleryVideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_featured', 'is_active', 'views']
    list_filter = ['category', 'is_featured', 'is_active']
    search_fields = ['title', 'description']
    ordering = ['display_order', '-created_at']
    readonly_fields = ['views', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Video Details', {
            'fields': ('title', 'description', 'video_url', 'thumbnail', 'category', 'service')
        }),
        ('Display', {
            'fields': ('display_order', 'is_featured', 'is_active')
        }),
        ('Statistics', {
            'fields': ('views',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'rating', 'service', 'is_featured', 'is_approved']
    list_filter = ['rating', 'is_featured', 'is_approved', 'service']
    search_fields = ['content', 'client_name', 'client__email']
    ordering = ['display_order', '-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Testimonial Details', {
            'fields': ('client', 'client_name', 'client_photo', 'content', 'rating')
        }),
        ('Associations', {
            'fields': ('service', 'staff')
        }),
        ('Moderation', {
            'fields': ('is_featured', 'is_approved', 'display_order')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def display_name(self, obj):
        return obj.display_name
    display_name.short_description = 'Client'