# Initial Data Setup Command
# apps/campus/management/commands/setup_initial_data.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.campus.models import Campus, CampusConfiguration
import json
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up initial campus data and demo users'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Campus.objects.all().delete()
            User.objects.all().delete()
        
        # Create campuses that match frontend mockUniversity.json
        campuses_data = [
            {
                'id': 1,
                'name': 'Surigao del Norte State University',
                'code': 'SNSU',
                'domain': 'snsu.edu.ph',
                'address': 'Narciso St., Surigao City, Surigao del Norte',
                'phone': '+63 86 826 1252',
                'email': 'info@snsu.edu.ph',
                'latitude': 9.7893,
                'longitude': 125.4954,
                'branding_config': {
                    'primary_color': '#22c55e',
                    'secondary_color': '#166534',
                    'logo_url': '/images/logos/snsu-logo.png'
                }
            },
            {
                'id': 2,
                'name': 'SNSU Malimono Campus',
                'code': 'MALIMONO',
                'domain': 'malimono.snsu.edu.ph',
                'address': 'Malimono, Surigao del Norte',
                'phone': '+63 86 826 1253',
                'email': 'malimono@snsu.edu.ph',
                'latitude': 9.6167,
                'longitude': 125.4833,
                'branding_config': {
                    'primary_color': '#1e40af',
                    'secondary_color': '#1e3a8a',
                    'logo_url': '/images/logos/malimono-logo.png'
                }
            },
            {
                'id': 3,
                'name': 'SNSU Del Carmen Campus',
                'code': 'DELCARMEN',
                'domain': 'delcarmen.snsu.edu.ph',
                'address': 'Del Carmen, Surigao del Norte',
                'phone': '+63 86 826 1254',
                'email': 'delcarmen@snsu.edu.ph',
                'latitude': 9.6000,
                'longitude': 125.5000,
                'branding_config': {
                    'primary_color': '#dc2626',
                    'secondary_color': '#991b1b',
                    'logo_url': '/images/logos/delcarmen-logo.png'
                }
            },
            {
                'id': 4,
                'name': 'SNSU Mainit Campus',
                'code': 'MAINIT',
                'domain': 'mainit.snsu.edu.ph',
                'address': 'Mainit, Surigao del Norte',
                'phone': '+63 86 826 1255',
                'email': 'mainit@snsu.edu.ph',
                'latitude': 9.5500,
                'longitude': 125.5167,
                'branding_config': {
                    'primary_color': '#7c3aed',
                    'secondary_color': '#5b21b6',
                    'logo_url': '/images/logos/mainit-logo.png'
                }
            }
        ]
        
        self.stdout.write('Creating campuses...')
        for campus_data in campuses_data:
            campus, created = Campus.objects.get_or_create(
                id=campus_data['id'],
                defaults=campus_data
            )
            
            if created:
                # Create campus configuration
                CampusConfiguration.objects.create(
                    campus=campus,
                    multi_campus_events_enabled=True,
                    cross_campus_attendance_enabled=True,
                    qr_code_expiry_hours=24,
                    attendance_window_minutes=30,
                    gps_validation_enabled=True,
                    gps_radius_meters=100
                )
                self.stdout.write(f'✅ Created campus: {campus.name}')
            else:
                self.stdout.write(f'📋 Campus already exists: {campus.name}')
        
        # Create demo admin user
        main_campus = Campus.objects.get(code='SNSU')
        
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@snsu.edu.ph',
                'first_name': 'Nilo',
                'last_name': 'Olang',
                'middle_name': 'Jr.',
                'student_id': 'ADMIN001',
                'campus': main_campus,
                'role': 'super_admin',
                'department': 'Administration',
                'is_staff': True,
                'is_superuser': True,
                'phone': '09171234567',
                'address': 'Narciso St., Surigao City',
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('✅ Created admin user: admin@snsu.edu.ph (password: admin123)')
        else:
            self.stdout.write('📋 Admin user already exists')
        
        # Create demo organizer
        organizer_user, created = User.objects.get_or_create(
            username='organizer',
            defaults={
                'email': 'organizer@snsu.edu.ph',
                'first_name': 'Maria',
                'last_name': 'Santos',
                'student_id': 'ORG001',
                'campus': main_campus,
                'role': 'organizer',
                'department': 'Student Affairs',
                'is_staff': True,
                'phone': '09171234568',
            }
        )
        
        if created:
            organizer_user.set_password('organizer123')
            organizer_user.save()
            self.stdout.write('✅ Created organizer user: organizer@snsu.edu.ph (password: organizer123)')
        else:
            self.stdout.write('📋 Organizer user already exists')
        
        # Create demo student
        student_user, created = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@snsu.edu.ph',
                'first_name': 'Juan',
                'last_name': 'Cruz',
                'student_id': '2024-000001',
                'campus': main_campus,
                'role': 'student',
                'department': 'College of Engineering and Information Technology',
                'course': 'Bachelor of Science in Information Technology',
                'year_level': '3',
                'section': 'A',
                'phone': '09171234569',
            }
        )
        
        if created:
            student_user.set_password('student123')
            student_user.save()
            self.stdout.write('✅ Created student user: student@snsu.edu.ph (password: student123)')
        else:
            self.stdout.write('📋 Student user already exists')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Initial data setup complete!\n'
                f'📊 {Campus.objects.count()} campuses created\n'
                f'👥 {User.objects.count()} users created\n\n'
                f'Login credentials:\n'
                f'  Admin: admin / admin123\n'
                f'  Organizer: organizer / organizer123\n'
                f'  Student: student / student123\n'
            )
        )
