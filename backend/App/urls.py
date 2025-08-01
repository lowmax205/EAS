"""
URL configuration for EAS Multi-Campus Event Attendance System.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.common.health import health_check, api_info

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('rest_framework.urls')),
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/info/', api_info, name='api-info'),
    path('api/v1/', include('apps.campus.api.urls')),
    # path('api/v1/', include('apps.accounts.api.urls')),
    # path('api/v1/', include('apps.events.api.urls')),
    # path('api/v1/', include('apps.attendance.api.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
