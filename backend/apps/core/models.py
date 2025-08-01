"""
Core models for EAS backend.
Contains base models and shared functionality.
"""

from django.db import models
from django.contrib.auth.models import User
import uuid


class BaseModel(models.Model):
    """
    Abstract base model with common fields for all models.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='%(class)s_created'
    )
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='%(class)s_updated'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Campus(BaseModel):
    """
    Campus model for multi-campus support.
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Asia/Manila')

    class Meta:
        verbose_name_plural = 'Campuses'

    def __str__(self):
        return f"{self.name} ({self.code})"


class Department(BaseModel):
    """
    Department model for organizing users and events.
    """
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ['campus', 'code']

    def __str__(self):
        return f"{self.campus.code} - {self.name}"
