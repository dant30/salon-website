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
    help = 'Populate staff database with Caroline Njeri (Virginia Hair Braider) information'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate staff...'))
        
        with transaction.atomic():
            self.create_caroline_staff()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated staff data!'))

    def create_caroline_staff(self):
        """Create Caroline Njeri as the main stylist (Virginia Hair Braider)"""
        
        # First, create or get Caroline's user account
        try:
            caroline_user, created = User.objects.get_or_create(
                email='berthaajohn151@gmail.com',  # Keep same email
                defaults={
                    'first_name': 'Caroline',
                    'last_name': 'Njeri',
                    'phone': '(570) 331-1503',  # Same phone
                    'is_active': True,
                    'is_staff': True,
                    'is_staff_member': True
                }
            )
            
            # Update name if user already exists
            if not created:
                caroline_user.first_name = 'Caroline'
                caroline_user.last_name = 'Njeri'
                caroline_user.save()
            
            if created:
                caroline_user.set_password('Caroline123!')  # Set a secure password
                caroline_user.save()
            
            # Create staff profile
            staff, staff_created = Staff.objects.get_or_create(
                user=caroline_user,
                defaults={
                    'title': 'Master Braider & Owner',
                    'bio': 'Caroline "Virginia" Njeri is a highly skilled hair braider with years of experience specializing in protective styles, braids, locs, and extensions. Known professionally as Virginia Hair Braider, she is passionate about creating beautiful, healthy hairstyles that make her clients feel confident and beautiful.',
                    'experience_years': 8,
                    'phone': '(570) 331-1503',
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
            
            # Update bio if staff already exists
            if not staff_created:
                staff.bio = 'Caroline "Virginia" Njeri is a highly skilled hair braider with years of experience specializing in protective styles, braids, locs, and extensions. Known professionally as Virginia Hair Braider, she is passionate about creating beautiful, healthy hairstyles that make her clients feel confident and beautiful.'
                staff.save()
            
            # Add specializations (all service categories)
            all_categories = ServiceCategory.objects.all()
            staff.specialization.set(all_categories)
            
            status = 'Created' if staff_created else 'Updated'
            self.stdout.write(f"  {status}: Caroline Njeri (Virginia Hair Braider) staff profile")
            
            # Create staff services (link Caroline to all services)
            self.create_staff_services(staff)
            
            # Create sample availability
            self.create_sample_availability(staff)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating Caroline staff: {str(e)}"))

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
        
        self.stdout.write(f"  Linked {all_services.count()} services to Caroline")

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
        
        appointments_created = 0
        for day_offset in range(30):
            current_date = today + timedelta(days=day_offset)
            day_name = current_date.strftime('%A')
            
            if day_name in working_hours:
                day_schedule = working_hours[day_name]
                
                if day_schedule['open'] and day_schedule['close']:
                    # Create morning slot (9 AM - 12 PM)
                    StaffAvailability.objects.create(
                        staff=staff,
                        date=current_date,
                        start_time=time(9, 0),   # 9:00 AM
                        end_time=time(12, 0),    # 12:00 PM
                        is_available=True,
                        reason='Morning appointments'
                    )
                    
                    # Create afternoon slot (1 PM - 5 PM)
                    StaffAvailability.objects.create(
                        staff=staff,
                        date=current_date,
                        start_time=time(13, 0),  # 1:00 PM
                        end_time=time(17, 0),    # 5:00 PM
                        is_available=True,
                        reason='Afternoon appointments'
                    )
                    
                    # Create evening slot if open until 7 PM (5 PM - 7 PM)
                    if day_schedule['close'] == '19:00':
                        StaffAvailability.objects.create(
                            staff=staff,
                            date=current_date,
                            start_time=time(17, 0),  # 5:00 PM
                            end_time=time(19, 0),    # 7:00 PM
                            is_available=True,
                            reason='Evening appointments'
                        )
                    
                    appointments_created += 1
        
        self.stdout.write(f"  Created availability for {appointments_created} days")