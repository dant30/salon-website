from rest_framework import serializers
from .models import GalleryCategory, GalleryImage, GalleryVideo, Testimonial
from apps.services.serializers import ServiceSerializer
from apps.staff.serializers import StaffListSerializer
from apps.users.serializers import UserSerializer


class GalleryCategorySerializer(serializers.ModelSerializer):
    image_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryCategory
        fields = [
            'id', 'name', 'description', 'icon',
            'display_order', 'is_active', 'image_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_count(self, obj):
        return obj.images.filter(is_active=True).count()


class GalleryImageSerializer(serializers.ModelSerializer):
    category = GalleryCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GalleryCategory.objects.filter(is_active=True),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=GalleryImage.service.field.related_model.objects.filter(is_active=True),
        source='service',
        write_only=True,
        required=False,
        allow_null=True
    )
    staff = StaffListSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=GalleryImage.staff.field.related_model.objects.filter(is_active=True),
        source='staff',
        write_only=True,
        required=False,
        allow_null=True
    )
    tags_list = serializers.ListField(
        child=serializers.CharField(),
        source='get_tags_list',
        read_only=True
    )
    
    class Meta:
        model = GalleryImage
        fields = [
            'id', 'title', 'description', 'image', 'thumbnail',
            'category', 'category_id', 'image_type', 'is_before_after',
            'before_image', 'after_image', 'transformation_description',
            'tags', 'tags_list', 'service', 'service_id', 'staff', 'staff_id',
            'display_order', 'is_featured', 'is_active', 'views', 'likes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'thumbnail', 'views', 'likes', 'created_at', 'updated_at'
        ]
    
    def get_tags_list(self, obj):
        return [tag.strip() for tag in obj.tags.split(',') if tag.strip()] if obj.tags else []


class GalleryImageListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    
    class Meta:
        model = GalleryImage
        fields = [
            'id', 'title', 'description', 'image', 'thumbnail',
            'category', 'image_type', 'is_featured', 'views', 'likes'
        ]


class GalleryVideoSerializer(serializers.ModelSerializer):
    category = GalleryCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GalleryCategory.objects.filter(is_active=True),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=GalleryVideo.service.field.related_model.objects.filter(is_active=True),
        source='service',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = GalleryVideo
        fields = [
            'id', 'title', 'description', 'video_url', 'thumbnail',
            'category', 'category_id', 'service', 'service_id',
            'display_order', 'is_featured', 'is_active', 'views',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views', 'created_at', 'updated_at']


class TestimonialSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Testimonial.client.field.related_model.objects.all(),
        source='client',
        write_only=True,
        required=False,
        allow_null=True
    )
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Testimonial.service.field.related_model.objects.filter(is_active=True),
        source='service',
        write_only=True,
        required=False,
        allow_null=True
    )
    staff = StaffListSerializer(read_only=True)
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=Testimonial.staff.field.related_model.objects.filter(is_active=True),
        source='staff',
        write_only=True,
        required=False,
        allow_null=True
    )
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client', 'client_id', 'client_name', 'client_photo',
            'content', 'rating', 'service', 'service_id', 'staff', 'staff_id',
            'is_featured', 'is_approved', 'display_order', 'display_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'display_name', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Ensure either client or client_name is provided
        if not data.get('client') and not data.get('client_name'):
            raise serializers.ValidationError(
                "Either client or client_name must be provided"
            )
        return data


class TestimonialListSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    service = serializers.StringRelatedField()
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'display_name', 'client_photo', 'content',
            'rating', 'service', 'is_featured'
        ]