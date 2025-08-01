from django.apps import AppConfig


class CampusConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.campus'
    verbose_name = 'Campus Management'
    
    def ready(self):
        # Import signals if needed
        try:
            import apps.campus.signals
        except ImportError:
            pass
