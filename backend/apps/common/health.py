# Health Check Views
# apps/common/health.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.conf import settings
import datetime


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint - no authentication required
    """
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    health_data = {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0",
        "database": db_status,
        "debug": settings.DEBUG,
        "message": "EAS API is running"
    }
    
    return Response(health_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """
    API information endpoint - no authentication required
    """
    info_data = {
        "name": "EAS Multi-Campus Event Attendance System API",
        "version": "1.0.0",
        "description": "Django REST API for multi-campus event attendance management",
        "endpoints": {
            "auth": "/api/v1/auth/",
            "campuses": "/api/v1/campuses/",
            "health": "/api/v1/health/",
            "info": "/api/v1/info/"
        },
        "documentation": "https://github.com/lowmax205/EAS",
        "support": "Multi-campus architecture with role-based access control"
    }
    
    return Response(info_data, status=status.HTTP_200_OK)
