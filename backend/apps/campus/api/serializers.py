# Campus API Serializers
# apps/campus/api/serializers.py

from rest_framework import serializers
from ..models import Campus, CampusConfiguration


class CampusConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusConfiguration
        fields = [
            'multi_campus_events_enabled',
            'cross_campus_attendance_enabled',
            'qr_code_expiry_hours',
            'attendance_window_minutes',
            'email_notifications_enabled',
            'sms_notifications_enabled',
            'gps_validation_enabled',
            'gps_radius_meters',
        ]


class CampusSerializer(serializers.ModelSerializer):
    configuration = CampusConfigurationSerializer(read_only=True)
    active_events_count = serializers.ReadOnlyField(source='get_active_events_count')
    total_users_count = serializers.ReadOnlyField(source='get_total_users_count')
    
    class Meta:
        model = Campus
        fields = [
            'id',
            'name',
            'code',
            'domain',
            'address',
            'phone',
            'email',
            'latitude',
            'longitude',
            'timezone',
            'locale',
            'is_active',
            'branding_config',
            'configuration',
            'active_events_count',
            'total_users_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampusListSerializer(serializers.ModelSerializer):
    """Simplified serializer for campus lists"""
    
    class Meta:
        model = Campus
        fields = [
            'id',
            'name',
            'code',
            'domain',
            'is_active',
        ]
