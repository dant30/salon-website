from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Appointment
from utils.email_service import send_appointment_reminder


@receiver(post_save, sender=Appointment)
def update_appointment_status(sender, instance, created, **kwargs):
    """Update appointment status based on payment."""
    if not created and instance.payment_status == 'paid' and instance.status == 'pending':
        instance.status = 'confirmed'
        instance.save(update_fields=['status'])


@receiver(pre_save, sender=Appointment)
def check_for_reminders(sender, instance, **kwargs):
    """Check if reminder needs to be sent."""
    if instance.pk:
        old_instance = Appointment.objects.get(pk=instance.pk)
        
        # Check if appointment is within 24 hours and reminder hasn't been sent
        appointment_datetime = timezone.make_aware(
            timezone.datetime.combine(instance.appointment_date, instance.start_time)
        )
        
        if (appointment_datetime - timezone.now()) <= timedelta(hours=24):
            if not instance.reminder_sent and instance.status in ['pending', 'confirmed']:
                send_appointment_reminder(instance)
                instance.reminder_sent = True