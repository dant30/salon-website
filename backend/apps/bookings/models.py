from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.staff.models import Staff
from apps.services.models import Service

User = get_user_model()


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial Payment'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    
    # Appointment details
    client = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='appointments'
    )
    staff = models.ForeignKey(
        Staff, 
        on_delete=models.CASCADE, 
        related_name='appointments'
    )
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE, 
        related_name='appointments'
    )
    
    # Date and time
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    # Status and tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='pending'
    )
    
    # Pricing
    service_price = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    discount_amount = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    tax_amount = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total_amount = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    amount_paid = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Additional information
    notes = models.TextField(blank=True)
    special_requests = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    # Reminders and notifications
    reminder_sent = models.BooleanField(default=False)
    confirmation_sent = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-appointment_date', 'start_time']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['staff', 'appointment_date']),
            models.Index(fields=['status']),
            models.Index(fields=['appointment_date']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['staff', 'appointment_date', 'start_time'],
                name='unique_staff_time_slot'
            ),
            models.CheckConstraint(
                check=models.Q(start_time__lt=models.F('end_time')),
                name='start_time_before_end_time'
            ),
        ]
    
    def __str__(self):
        return f"{self.client.email} - {self.service.name} - {self.appointment_date} {self.start_time}"
    
    def save(self, *args, **kwargs):
        # Calculate end time based on service duration if not provided
        if not self.end_time and self.service and self.start_time:
            from datetime import datetime, timedelta
            start_dt = datetime.combine(self.appointment_date, self.start_time)
            end_dt = start_dt + timedelta(minutes=self.service.duration)
            self.end_time = end_dt.time()
        
        # Calculate total amount
        if not self.total_amount and self.service_price:
            self.total_amount = self.service_price - self.discount_amount + self.tax_amount
        
        super().save(*args, **kwargs)
    
    @property
    def is_upcoming(self):
        from datetime import datetime
        now = timezone.now()
        appointment_datetime = datetime.combine(self.appointment_date, self.start_time)
        return appointment_datetime > now and self.status in ['pending', 'confirmed']
    
    @property
    def duration_minutes(self):
        from datetime import datetime
        if self.start_time and self.end_time:
            start = datetime.combine(self.appointment_date, self.start_time)
            end = datetime.combine(self.appointment_date, self.end_time)
            return int((end - start).total_seconds() / 60)
        return 0
    
    @property
    def balance_due(self):
        return max(self.total_amount - self.amount_paid, 0)


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('online', 'Online Payment'),
        ('bank_transfer', 'Bank Transfer'),
        ('wallet', 'Digital Wallet'),
    ]
    
    appointment = models.ForeignKey(
        Appointment, 
        on_delete=models.CASCADE, 
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES
    )
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    is_refunded = models.BooleanField(default=False)
    refund_date = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    class Meta:
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment #{self.id} - {self.amount} - {self.appointment}"


class Review(models.Model):
    appointment = models.OneToOneField(
        Appointment, 
        on_delete=models.CASCADE, 
        related_name='review'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    staff_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    service_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    is_featured = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['appointment']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_featured']),
        ]
    
    def __str__(self):
        return f"Review for {self.appointment} - {self.rating} stars"
    
    @property
    def client_name(self):
        return self.appointment.client.get_full_name() or self.appointment.client.email
    
    @property
    def service_name(self):
        return self.appointment.service.name


class CancellationPolicy(models.Model):
    name = models.CharField(max_length=100)
    hours_before = models.PositiveIntegerField(
        help_text="Hours before appointment when cancellation is allowed"
    )
    penalty_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100)],
        help_text="Percentage of total amount charged as penalty"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Cancellation Policies"
        ordering = ['hours_before']
    
    def __str__(self):
        return self.name