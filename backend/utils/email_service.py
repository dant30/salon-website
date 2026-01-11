from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime


def send_email(subject, message, recipient_list, html_message=None, from_email=None):
    """Send email with optional HTML content."""
    if from_email is None:
        from_email = settings.DEFAULT_FROM_EMAIL
    
    if html_message:
        # Create text version from HTML
        text_message = strip_tags(html_message)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=from_email,
            to=recipient_list
        )
        email.attach_alternative(html_message, "text/html")
        return email.send()
    else:
        return send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False
        )


def send_welcome_email(user):
    """Send welcome email to new user."""
    subject = f"Welcome to {settings.SITE_NAME}"
    
    context = {
        'user': user,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/welcome.html', context)
    text_message = render_to_string('emails/welcome.txt', context)
    
    send_email(
        subject=subject,
        message=text_message,
        recipient_list=[user.email],
        html_message=html_message
    )


def send_appointment_confirmation(appointment):
    """Send appointment confirmation email."""
    subject = f"Appointment Confirmation - {appointment.service.name}"
    
    context = {
        'appointment': appointment,
        'client': appointment.client,
        'service': appointment.service,
        'staff': appointment.staff,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/appointment_confirmation.html', context)
    text_message = render_to_string('emails/appointment_confirmation.txt', context)
    
    send_email(
        subject=subject,
        message=text_message,
        recipient_list=[appointment.client.email],
        html_message=html_message
    )


def send_appointment_reminder(appointment):
    """Send appointment reminder email (24 hours before)."""
    subject = f"Appointment Reminder - {appointment.service.name}"
    
    context = {
        'appointment': appointment,
        'client': appointment.client,
        'service': appointment.service,
        'staff': appointment.staff,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/appointment_reminder.html', context)
    text_message = render_to_string('emails/appointment_reminder.txt', context)
    
    send_email(
        subject=subject,
        message=text_message,
        recipient_list=[appointment.client.email],
        html_message=html_message
    )


def send_appointment_cancellation(appointment, reason=""):
    """Send appointment cancellation email."""
    subject = f"Appointment Cancelled - {appointment.service.name}"
    
    context = {
        'appointment': appointment,
        'client': appointment.client,
        'service': appointment.service,
        'staff': appointment.staff,
        'reason': reason,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/appointment_cancellation.html', context)
    text_message = render_to_string('emails/appointment_cancellation.txt', context)
    
    send_email(
        subject=subject,
        message=text_message,
        recipient_list=[appointment.client.email],
        html_message=html_message
    )


def send_password_reset_email(user, reset_link):
    """Send password reset email."""
    subject = f"Password Reset Request - {settings.SITE_NAME}"
    
    context = {
        'user': user,
        'reset_link': reset_link,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/password_reset.html', context)
    text_message = render_to_string('emails/password_reset.txt', context)
    
    send_email(
        subject=subject,
        message=text_message,
        recipient_list=[user.email],
        html_message=html_message
    )


def send_staff_notification(appointment, action):
    """Send notification to staff about appointment changes."""
    if not appointment.staff.user.email:
        return
    
    subject = f"Appointment {action.capitalize()} - {appointment.service.name}"
    
    context = {
        'appointment': appointment,
        'client': appointment.client,
        'service': appointment.service,
        'action': action,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/staff_notification.html', context)
    text_message = render_to_string('emails/staff_notification.txt', context)
    
    send_email(
        subject=subject,
        message=text_message,
        recipient_list=[appointment.staff.user.email],
        html_message=html_message
    )


def send_contact_form_email(name, email, subject, message, to_email=None):
    """Send contact form submission."""
    if to_email is None:
        to_email = settings.CONTACT_EMAIL
    
    full_subject = f"Contact Form: {subject}"
    
    context = {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
        'site_name': settings.SITE_NAME,
        'current_year': datetime.now().year,
    }
    
    html_message = render_to_string('emails/contact_form.html', context)
    text_message = render_to_string('emails/contact_form.txt', context)
    
    # Send to admin
    send_email(
        subject=full_subject,
        message=text_message,
        recipient_list=[to_email],
        html_message=html_message
    )
    
    # Send confirmation to user
    confirmation_subject = f"We received your message - {settings.SITE_NAME}"
    confirmation_html = render_to_string('emails/contact_confirmation.html', context)
    confirmation_text = render_to_string('emails/contact_confirmation.txt', context)
    
    send_email(
        subject=confirmation_subject,
        message=confirmation_text,
        recipient_list=[email],
        html_message=confirmation_html
    )