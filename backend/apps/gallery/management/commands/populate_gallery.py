# apps/gallery/management/commands/populate_gallery.py
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.gallery.models import GalleryCategory, GalleryImage, GalleryVideo, Testimonial
from apps.services.models import Service
from apps.staff.models import Staff
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate gallery and testimonials with sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate gallery...'))
        
        with transaction.atomic():
            self.create_gallery_categories()
            self.create_sample_testimonials()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated gallery data!'))

    def create_gallery_categories(self):
        """Create gallery categories"""
        categories = [
            {'name': 'Before & After', 'description': 'Transformation results', 'display_order': 1},
            {'name': 'Boho Braids', 'description': 'Bohemian braid styles', 'display_order': 2},
            {'name': 'Senegal Twists', 'description': 'Traditional twist styles', 'display_order': 3},
            {'name': 'Butterfly Locs', 'description': 'Faux loc creations', 'display_order': 4},
            {'name': 'Knotless Braids', 'description': 'Modern braiding techniques', 'display_order': 5},
            {'name': 'Men\'s Styles', 'description': 'Hairstyles for men', 'display_order': 6},
            {'name': 'Special Events', 'description': 'Special occasion styles', 'display_order': 7},
        ]
        
        for cat_data in categories:
            category, created = GalleryCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'display_order': cat_data['display_order']
                }
            )
            status = 'Created' if created else 'Exists'
            self.stdout.write(f"  {status}: {category.name}")

    def create_sample_testimonials(self):
        """Create sample testimonials"""
        try:
            virginia = Staff.objects.get(user__email='berthaajohn151@gmail.com')
            services = Service.objects.filter(is_active=True)[:5]
            
            testimonials = [
                {
                    'client_name': 'Jessica M.',
                    'content': 'Virginia is AMAZING! My boho braids came out perfect and lasted for weeks. She\'s so professional and her attention to detail is incredible. Will definitely be coming back!',
                    'rating': 5,
                    'service': services[0] if services else None,
                    'staff': virginia,
                    'is_featured': True,
                    'is_approved': True
                },
                {
                    'client_name': 'Sarah T.',
                    'content': 'I got my first set of butterfly locs from Virginia and I\'m in love! She took her time to make sure everything was perfect. The salon is clean and she\'s so friendly.',
                    'rating': 5,
                    'service': services[1] if len(services) > 1 else None,
                    'staff': virginia,
                    'is_featured': True,
                    'is_approved': True
                },
                {
                    'client_name': 'Michael R.',
                    'content': 'Best men\'s braids I\'ve ever had! Virginia knows exactly how to work with men\'s hair and the style held up perfectly. Great service and reasonable prices.',
                    'rating': 5,
                    'service': services[2] if len(services) > 2 else None,
                    'staff': virginia,
                    'is_featured': True,
                    'is_approved': True
                },
                {
                    'client_name': 'Amanda K.',
                    'content': 'My Senegal twists are gorgeous! Virginia was so patient and made sure I was comfortable throughout the entire process. She\'s truly an artist.',
                    'rating': 5,
                    'service': services[3] if len(services) > 3 else None,
                    'staff': virginia,
                    'is_featured': False,
                    'is_approved': True
                },
                {
                    'client_name': 'Robert J.',
                    'content': 'Virginia did an incredible job with my loc maintenance. She\'s knowledgeable and really cares about hair health. Highly recommended!',
                    'rating': 5,
                    'service': services[4] if len(services) > 4 else None,
                    'staff': virginia,
                    'is_featured': False,
                    'is_approved': True
                },
            ]
            
            for i, testimonial_data in enumerate(testimonials):
                testimonial, created = Testimonial.objects.get_or_create(
                    client_name=testimonial_data['client_name'],
                    content=testimonial_data['content'][:100],  # Use first 100 chars for uniqueness check
                    defaults={
                        'content': testimonial_data['content'],
                        'rating': testimonial_data['rating'],
                        'service': testimonial_data['service'],
                        'staff': testimonial_data['staff'],
                        'is_featured': testimonial_data['is_featured'],
                        'is_approved': testimonial_data['is_approved'],
                        'display_order': i + 1
                    }
                )
                status = 'Created' if created else 'Exists'
                self.stdout.write(f"  {status}: Testimonial from {testimonial.client_name}")
                
        except Staff.DoesNotExist:
            self.stdout.write(self.style.WARNING('Virginia staff profile not found. Run populate_staff first.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating testimonials: {str(e)}"))