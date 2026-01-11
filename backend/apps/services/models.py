from django.db import models
from django.core.validators import MinValueValidator


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="FontAwesome icon class")
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Service Categories"
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class Service(models.Model):
    category = models.ForeignKey(
        ServiceCategory, 
        on_delete=models.CASCADE, 
        related_name='services'
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    price = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    discounted_price = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_popular']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        return self.discounted_price if self.discounted_price else self.price
    
    @property
    def discount_percentage(self):
        if self.discounted_price and self.price > 0:
            return round(((self.price - self.discounted_price) / self.price) * 100, 1)
        return 0


class ServiceImage(models.Model):
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    image = models.ImageField(upload_to='service_images/')
    caption = models.CharField(max_length=200, blank=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order', 'created_at']
    
    def __str__(self):
        return f"{self.service.name} - Image {self.id}"