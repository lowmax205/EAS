# Events App Configuration
# apps/events/apps.py

from django.apps import AppConfig


class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.events'
    verbose_name = 'Event Management'
    
    def ready(self):
        # Import signals
        try:
            import apps.events.signals
        except ImportError:
            pass
