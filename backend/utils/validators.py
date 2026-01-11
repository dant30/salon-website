import re
from datetime import datetime
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import BaseValidator


class PhoneNumberValidator(BaseValidator):
    """Validate phone number format."""
    
    message = _('Enter a valid phone number.')
    code = 'invalid_phone'
    
    def __init__(self, regex=None, message=None, code=None):
        self.regex = regex or r'^\+?1?\d{9,15}$'
        if message is not None:
            self.message = message
        if code is not None:
            self.code = code
        super().__init__(limit_value=None, message=self.message)
    
    def __call__(self, value):
        if not re.match(self.regex, value):
            raise ValidationError(self.message, code=self.code, params={'value': value})


class FutureDateValidator(BaseValidator):
    """Validate that date is in the future."""
    
    message = _('Date must be in the future.')
    code = 'future_date'
    
    def __call__(self, value):
        from django.utils import timezone
        if value <= timezone.now().date():
            raise ValidationError(self.message, code=self.code, params={'value': value})


class TimeRangeValidator(BaseValidator):
    """Validate that start time is before end time."""
    
    message = _('Start time must be before end time.')
    code = 'invalid_time_range'
    
    def __call__(self, value):
        start_time = value.get('start_time')
        end_time = value.get('end_time')
        
        if start_time and end_time and start_time >= end_time:
            raise ValidationError(self.message, code=self.code, params={'value': value})


class DurationValidator(BaseValidator):
    """Validate duration is within reasonable limits."""
    
    message = _('Duration must be between %(min)s and %(max)s minutes.')
    code = 'invalid_duration'
    
    def __init__(self, min_minutes=5, max_minutes=480, message=None, code=None):
        self.min_minutes = min_minutes
        self.max_minutes = max_minutes
        if message is not None:
            self.message = message
        if code is not None:
            self.code = code
        super().__init__(limit_value=None, message=self.message)
    
    def __call__(self, value):
        if not (self.min_minutes <= value <= self.max_minutes):
            raise ValidationError(
                self.message,
                code=self.code,
                params={'value': value, 'min': self.min_minutes, 'max': self.max_minutes}
            )


def validate_image_size(image, max_size_mb=5):
    """Validate image file size."""
    max_size = max_size_mb * 1024 * 1024  # Convert to bytes
    
    if image.size > max_size:
        raise ValidationError(
            f'Image file too large. Size should not exceed {max_size_mb}MB.'
        )


def validate_file_extension(value, allowed_extensions=None):
    """Validate file extension."""
    if allowed_extensions is None:
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    
    import os
    ext = os.path.splitext(value.name)[1].lower()
    
    if ext not in allowed_extensions:
        raise ValidationError(
            f'Unsupported file extension. Allowed extensions: {", ".join(allowed_extensions)}'
        )