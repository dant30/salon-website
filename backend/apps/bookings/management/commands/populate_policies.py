# apps/bookings/management/commands/populate_policies.py
from django.core.management.base import BaseCommand
from apps.bookings.models import CancellationPolicy


class Command(BaseCommand):
    help = 'Populate cancellation policies'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate policies...'))
        
        policies = [
            {
                'name': '24-Hour Notice',
                'hours_before': 24,
                'penalty_percentage': 0,
                'is_active': True
            },
            {
                'name': 'Same Day Cancellation',
                'hours_before': 4,
                'penalty_percentage': 25,
                'is_active': True
            },
            {
                'name': 'No Show',
                'hours_before': 0,
                'penalty_percentage': 50,
                'is_active': True
            },
        ]
        
        for policy_data in policies:
            policy, created = CancellationPolicy.objects.get_or_create(
                name=policy_data['name'],
                defaults=policy_data
            )
            
            if not created:
                for key, value in policy_data.items():
                    setattr(policy, key, value)
                policy.save()
            
            status = 'Created' if created else 'Updated'
            self.stdout.write(f"  {status}: {policy.name}")
        
        self.stdout.write(self.style.SUCCESS('Successfully populated policies!'))