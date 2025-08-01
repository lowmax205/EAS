# Campus API Views
# apps/campus/api/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from ..models import Campus, CampusConfiguration
from .serializers import CampusSerializer, CampusListSerializer, CampusConfigurationSerializer


class CampusViewSet(viewsets.ModelViewSet):
    """
    Campus management API
    Provides campus information and statistics
    """
    queryset = Campus.objects.filter(is_active=True)
    serializer_class = CampusSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']
    
    def get_queryset(self):
        """Filter campuses based on user access"""
        user = self.request.user
        if user.role == 'super_admin':
            return Campus.objects.all()
        
        accessible_campus_ids = user.get_accessible_campus_ids()
        return Campus.objects.filter(id__in=accessible_campus_ids)
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return CampusListSerializer
        return CampusSerializer
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get detailed campus statistics
        """
        campus = self.get_object()
        
        # Basic stats
        stats = {
            'campus': CampusListSerializer(campus).data,
            'users': {
                'total': campus.get_total_users_count(),
                'by_role': {},
            },
            'events': {
                'total': campus.get_active_events_count(),
                'by_type': {},
            },
            'attendance': {
                'total': 0,
                'verified': 0,
            }
        }
        
        # User stats by role
        from apps.accounts.models import User
        user_stats = User.objects.filter(campus=campus).values('role').annotate(
            count=models.Count('id')
        )
        for stat in user_stats:
            stats['users']['by_role'][stat['role']] = stat['count']
        
        # Event stats by type
        from apps.events.models import Event
        event_stats = Event.objects.filter(campus=campus).values('event_type').annotate(
            count=models.Count('id')
        )
        for stat in event_stats:
            stats['events']['by_type'][stat['event_type']] = stat['count']
        
        # Attendance stats
        from apps.attendance.models import Attendance
        attendance_total = Attendance.objects.filter(campus=campus).count()
        attendance_verified = Attendance.objects.filter(
            campus=campus, 
            is_verified=True
        ).count()
        
        stats['attendance']['total'] = attendance_total
        stats['attendance']['verified'] = attendance_verified
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def accessible(self, request):
        """
        Get list of campuses accessible to current user
        """
        campuses = self.get_queryset()
        serializer = CampusListSerializer(campuses, many=True)
        return Response({
            'campuses': serializer.data,
            'current_campus': CampusListSerializer(request.campus).data if request.campus else None
        })
