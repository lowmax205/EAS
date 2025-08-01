# Campus Context Middleware
# apps/shared/middleware.py

from django.utils.deprecation import MiddlewareMixin
from apps.campus.models import Campus


class CampusContextMiddleware(MiddlewareMixin):
    """
    Middleware to add campus context to requests
    Automatically detects campus from user or header
    """
    
    def process_request(self, request):
        """Add campus context to request"""
        request.campus = None
        request.accessible_campuses = []
        
        # Skip for unauthenticated requests
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return
        
        # Set user's primary campus
        if hasattr(request.user, 'campus'):
            request.campus = request.user.campus
        
        # Set accessible campuses based on user role
        if hasattr(request.user, 'get_accessible_campus_ids'):
            accessible_ids = request.user.get_accessible_campus_ids()
            request.accessible_campuses = Campus.objects.filter(
                id__in=accessible_ids,
                is_active=True
            )
        
        # Allow campus override via header (for multi-campus admins)
        campus_override = request.META.get('HTTP_X_CAMPUS_ID')
        if campus_override and request.user.role in ['campus_admin', 'super_admin']:
            try:
                override_campus = Campus.objects.get(
                    id=int(campus_override),
                    id__in=request.user.get_accessible_campus_ids()
                )
                request.campus = override_campus
            except (Campus.DoesNotExist, ValueError):
                pass  # Keep original campus
    
    def process_response(self, request, response):
        """Add campus information to response headers"""
        if hasattr(request, 'campus') and request.campus:
            response['X-Campus-ID'] = str(request.campus.id)
            response['X-Campus-Code'] = request.campus.code
        
        return response
