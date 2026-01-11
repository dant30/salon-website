from rest_framework import serializers
from .models import ServiceCategory, Service, ServiceImage


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'icon', 'display_order', 'is_active']
        read_only_fields = ['id']


class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'caption', 'display_order']
        read_only_fields = ['id']


class ServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.filter(is_active=True),
        source='category',
        write_only=True
    )
    images = ServiceImageSerializer(many=True, read_only=True)
    final_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    discount_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'category', 'category_id', 'name', 'slug', 'description',
            'duration', 'price', 'discounted_price', 'final_price',
            'discount_percentage', 'image', 'is_popular', 'is_active',
            'display_order', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ServiceListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    final_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'category', 'name', 'slug', 'description',
            'duration', 'final_price', 'image', 'is_popular'
        ]