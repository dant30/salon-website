import json
import random
import string
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils import timezone


def generate_random_string(length=10):
    """Generate a random string of fixed length."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))


def is_valid_email(email):
    """Check if email is valid."""
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


def calculate_end_time(start_time, duration_minutes):
    """Calculate end time based on start time and duration."""
    if isinstance(start_time, str):
        start_time = datetime.strptime(start_time, '%H:%M').time()
    
    start_dt = datetime.combine(datetime.today(), start_time)
    end_dt = start_dt + timedelta(minutes=duration_minutes)
    return end_dt.time()


def format_duration(minutes):
    """Format duration in minutes to human readable format."""
    hours = minutes // 60
    mins = minutes % 60
    
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{minutes}m"


def format_currency(amount):
    """Format currency amount."""
    return f"${amount:,.2f}"


def get_time_slots(start_time, end_time, interval_minutes=15):
    """Generate time slots between start and end times."""
    slots = []
    
    start_dt = datetime.combine(datetime.today(), start_time)
    end_dt = datetime.combine(datetime.today(), end_time)
    
    current_dt = start_dt
    while current_dt < end_dt:
        slot_end = current_dt + timedelta(minutes=interval_minutes)
        if slot_end <= end_dt:
            slots.append({
                'start': current_dt.time(),
                'end': slot_end.time()
            })
        current_dt = slot_end
    
    return slots


def get_week_dates(start_date=None):
    """Get dates for the current week."""
    if not start_date:
        start_date = timezone.now().date()
    
    # Get Monday of the week
    monday = start_date - timedelta(days=start_date.weekday())
    
    # Generate week dates
    week_dates = []
    for i in range(7):
        week_dates.append(monday + timedelta(days=i))
    
    return week_dates


def json_serializer(obj):
    """JSON serializer for objects not serializable by default json code."""
    if isinstance(obj, (datetime, timezone.datetime)):
        return obj.isoformat()
    if hasattr(obj, '__dict__'):
        return obj.__dict__
    raise TypeError(f"Type {type(obj)} not serializable")