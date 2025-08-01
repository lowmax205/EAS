# Attendance App Configuration
# apps/attendance/apps.py

from django.apps import AppConfig


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.attendance'
    verbose_name = 'Attendance Tracking'
    
    def ready(self):
        # Import signals
        try:
            import apps.attendance.signals
        except ImportError:
            pass
