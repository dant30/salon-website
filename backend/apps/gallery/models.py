from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class GalleryCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="FontAwesome icon class")
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Gallery Categories"
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class GalleryImage(models.Model):
    IMAGE_TYPE_CHOICES = [
        ('before_after', 'Before & After'),
        ('portfolio', 'Portfolio'),
        ('salon', 'Salon Interior'),
        ('team', 'Team'),
        ('event', 'Event'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='gallery/')
    thumbnail = models.ImageField(upload_to='gallery/thumbnails/', null=True, blank=True)
    category = models.ForeignKey(
        GalleryCategory, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='images'
    )
    image_type = models.CharField(
        max_length=20,
        choices=IMAGE_TYPE_CHOICES,
        default='portfolio'
    )
    
    # For before/after images
    is_before_after = models.BooleanField(default=False)
    before_image = models.ImageField(upload_to='gallery/before_after/', null=True, blank=True)
    after_image = models.ImageField(upload_to='gallery/before_after/', null=True, blank=True)
    transformation_description = models.TextField(blank=True)
    
    # Tags and metadata
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gallery_images'
    )
    staff = models.ForeignKey(
        'staff.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gallery_images'
    )
    
    # Display and sorting
    display_order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Statistics
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['image_type']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Set is_before_after based on image_type
        if self.image_type == 'before_after':
            self.is_before_after = True
        else:
            self.is_before_after = False
        
        super().save(*args, **kwargs)
    
    def increment_views(self):
        """Increment view count."""
        self.views += 1
        self.save(update_fields=['views'])
    
    def increment_likes(self):
        """Increment like count."""
        self.likes += 1
        self.save(update_fields=['likes'])


class GalleryVideo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_url = models.URLField(help_text="YouTube or Vimeo URL")
    thumbnail = models.ImageField(upload_to='gallery/video_thumbnails/', null=True, blank=True)
    category = models.ForeignKey(
        GalleryCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='videos'
    )
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gallery_videos'
    )
    display_order = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        """Increment view count."""
        self.views += 1
        self.save(update_fields=['views'])


class Testimonial(models.Model):
    client = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonials'
    )
    client_name = models.CharField(max_length=200, help_text="If client is not a user")
    client_photo = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    content = models.TextField()
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonials'
    )
    staff = models.ForeignKey(
        'staff.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonials'
    )
    is_featured = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return f"Testimonial from {self.client_name}"
    
    @property
    def display_name(self):
        if self.client:
            return self.client.get_full_name() or self.client.email
        return self.client_name