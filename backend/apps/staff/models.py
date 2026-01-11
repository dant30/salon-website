from django.db import models
from django.contrib.auth import get_user_model
from apps.services.models import ServiceCategory

User = get_user_model()


class Staff(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='staff_profile'
    )
    title = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    specialization = models.ManyToManyField(
        ServiceCategory,
        related_name='specialists'
    )
    experience_years = models.PositiveIntegerField(default=0)
    photo = models.ImageField(upload_to='staff/')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    
    # Social media links
    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    
    # Working hours (JSON field for flexibility)
    working_hours = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Staff"
        ordering = ['display_order', 'user__first_name']
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email}"
    
    @property
    def full_name(self):
        return self.user.get_full_name()
    
    @property
    def email(self):
        return self.user.email
    
    @property
    def phone_number(self):
        return self.phone or self.user.phone


class StaffService(models.Model):
    """Services that each staff member can perform with their specific pricing."""
    
    staff = models.ForeignKey(
        Staff, 
        on_delete=models.CASCADE, 
        related_name='staff_services'
    )
    service = models.ForeignKey(
        'services.Service',
        on_delete=models.CASCADE,
        related_name='staff_services'
    )
    custom_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Custom price for this staff member (optional)"
    )
    is_available = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['staff', 'service']
        ordering = ['service__name']
    
    def __str__(self):
        return f"{self.staff.user.get_full_name()} - {self.service.name}"
    
    @property
    def final_price(self):
        return self.custom_price if self.custom_price else self.service.final_price


class StaffAvailability(models.Model):
    """Staff member's availability for specific time slots."""
    
    staff = models.ForeignKey(
        Staff, 
        on_delete=models.CASCADE, 
        related_name='availabilities'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    reason = models.CharField(max_length=200, blank=True)
    
    class Meta:
        verbose_name_plural = "Staff Availabilities"
        ordering = ['date', 'start_time']
        unique_together = ['staff', 'date', 'start_time', 'end_time']
    
    def __str__(self):
        return f"{self.staff} - {self.date} {self.start_time}-{self.end_time}"


class StaffPreference(models.Model):
    """User's preferred staff members."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='stylist_preferences'
    )
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='preferred_clients'
    )
    is_primary = models.BooleanField(default=False, help_text="Primary/favorite stylist")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'staff')
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} prefers {self.staff.user.get_full_name()}"