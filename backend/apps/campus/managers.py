# Custom QuerySet and Manager for Campus-Aware Data Access
# apps/campus/managers.py

from django.db import models
from django.core.exceptions import PermissionDenied


class CampusAwareQuerySet(models.QuerySet):
    """
    QuerySet with campus-aware filtering methods
    """
    
    def for_campus(self, campus_id):
        """Filter by specific campus"""
        return self.filter(campus_id=campus_id)
    
    def for_user_campus(self, user):
        """Filter by user's campus with role-based access"""
        if user.role == 'super_admin':
            return self
        return self.filter(campus_id=user.campus_id)
    
    def accessible_to_user(self, user, campus_id=None):
        """Apply campus access control based on user permissions"""
        if user.role == 'super_admin':
            if campus_id:
                return self.filter(campus_id=campus_id)
            return self
        
        accessible_campuses = user.get_accessible_campus_ids()
        
        if campus_id and campus_id in accessible_campuses:
            return self.filter(campus_id=campus_id)
            
        return self.filter(campus_id=user.campus_id)


class CampusAwareManager(models.Manager):
    """
    Manager that automatically applies campus filtering
    """
    
    def get_queryset(self):
        return CampusAwareQuerySet(self.model, using=self._db)
    
    def for_campus(self, campus_id):
        return self.get_queryset().for_campus(campus_id)
    
    def for_user_campus(self, user):
        return self.get_queryset().for_user_campus(user)
    
    def accessible_to_user(self, user, campus_id=None):
        return self.get_queryset().accessible_to_user(user, campus_id)
