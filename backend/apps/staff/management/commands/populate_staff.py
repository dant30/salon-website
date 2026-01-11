# apps/staff/management/commands/populate_staff.py
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.staff.models import Staff, StaffService, StaffAvailability
from apps.services.models import ServiceCategory, Service
from django.contrib.auth import get_user_model
import json
from datetime import date, time, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate staff database with Virginia Hair Braider information'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate staff...'))
        
        with transaction.atomic():
            self.create_virginia_staff()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated staff data!'))

    def create_virginia_staff(self):
        """Create Virginia as the main stylist"""
        
        # First, create or get Virginia's user account
        try:
            virginia_user, created = User.objects.get_or_create(
                email='berthaajohn151@gmail.com',
                defaults={
                    'first_name': 'Virginia',
                    'last_name': 'Hair Braider',
                    'phone': '(570) 331-1503',
                    'is_active': True,
                    'is_staff': True,
                    'is_staff_member': True
                }
            )
            
            if created:
                virginia_user.set_password('Virginia123!')  # Set a secure password
                virginia_user.save()
            
            # Create staff profile
            staff, staff_created = Staff.objects.get_or_create(
                user=virginia_user,
                defaults={
                    'title': 'Master Braider & Owner',
                    'bio': 'Virginia is a highly skilled hair braider with years of experience specializing in protective styles, braids, locs, and extensions. She is passionate about creating beautiful, healthy hairstyles that make her clients feel confident and beautiful.',
                    'experience_years': 8,
                    'phone': '(570) 331-1503',  # Keep phone if needed, but email is removed
                    'is_active': True,
                    'display_order': 1,
                    'instagram': 'https://instagram.com/virginiahairbraider',
                    'facebook': 'https://facebook.com/virginiahairbraider',
                    'twitter': 'https://twitter.com/virginia_braider',
                    'working_hours': json.dumps({
                        'Monday': {'open': '09:00', 'close': '19:00'},
                        'Tuesday': {'open': '09:00', 'close': '19:00'},
                        'Wednesday': {'open': '09:00', 'close': '19:00'},
                        'Thursday': {'open': '09:00', 'close': '19:00'},
                        'Friday': {'open': '09:00', 'close': '19:00'},
                        'Saturday': {'open': '10:00', 'close': '17:00'},
                        'Sunday': {'open': '12:00', 'close': '16:00'}
                    })
                }
            )
            
            # Add specializations (all service categories)
            all_categories = ServiceCategory.objects.all()
            staff.specialization.set(all_categories)
            
            status = 'Created' if staff_created else 'Exists'
            self.stdout.write(f"  {status}: Virginia Hair Braider staff profile")
            
            # Create staff services (link Virginia to all services)
            self.create_staff_services(staff)
            
            # Create sample availability
            self.create_sample_availability(staff)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating Virginia staff: {str(e)}"))

    def create_staff_services(self, staff):
        """Link staff to all available services"""
        all_services = Service.objects.all()
        
        for service in all_services:
            staff_service, created = StaffService.objects.get_or_create(
                staff=staff,
                service=service,
                defaults={
                    'is_available': True,
                    'notes': 'Available for this service'
                }
            )
        
        self.stdout.write(f"  Linked {all_services.count()} services to Virginia")

    def create_sample_availability(self, staff):
        """Create sample availability for the next 30 days"""
        today = date.today()
        
        # Clear existing availability for the next 30 days
        StaffAvailability.objects.filter(
            staff=staff,
            date__gte=today,
            date__lte=today + timedelta(days=30)
        ).delete()
        
        # Create availability based on working hours
        working_hours = json.loads(staff.working_hours)
        
        for day_offset in range(30):
            current_date = today + timedelta(days=day_offset)
            day_name = current_date.strftime('%A')
            
            if day_name in working_hours:
                day_schedule = working_hours[day_name]
                
                if day_schedule['open'] and day_schedule['close']:
                    # Create morning slot
                    StaffAvailability.objects.create(
                        staff=staff,
                        date=current_date,
                        start_time=time(9, 0),  # 9:00 AM
                        end_time=time(12, 0),   # 12:00 PM
                        is_available=True,
                        reason='Morning appointments'
                    )
                    
                    # Create afternoon slot
                    StaffAvailability.objects.create(
                        staff=staff,
                        date=current_date,
                        start_time=time(13, 0),  # 1:00 PM
                        end_time=time(17, 0),    # 5:00 PM
                        is_available=True,
                        reason='Afternoon appointments'
                    )
        
        self.stdout.write(f"  Created availability for next 30 days")