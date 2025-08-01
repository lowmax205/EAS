# Accounts App Configuration
# apps/accounts/apps.py

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = 'User Management'
    
    def ready(self):
        # Import signals
        try:
            import apps.accounts.signals
        except ImportError:
            pass
