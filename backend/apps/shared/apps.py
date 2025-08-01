# Shared App Configuration
# apps/shared/apps.py

from django.apps import AppConfig


class SharedConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.shared'
    verbose_name = 'Shared Utilities'
