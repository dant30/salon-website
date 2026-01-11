import django_filters
from .models import GalleryImage


class GalleryImageFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category__name', lookup_expr='iexact')
    image_type = django_filters.CharFilter(field_name='image_type', lookup_expr='iexact')
    tags = django_filters.CharFilter(method='filter_by_tags')
    
    class Meta:
        model = GalleryImage
        fields = ['category', 'image_type', 'is_featured', 'service', 'staff', 'tags']
    
    def filter_by_tags(self, queryset, name, value):
        """Filter by comma-separated tags."""
        if value:
            tags = [tag.strip() for tag in value.split(',') if tag.strip()]
            for tag in tags:
                queryset = queryset.filter(tags__icontains=tag)
        return queryset