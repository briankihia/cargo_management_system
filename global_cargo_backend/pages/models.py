from django.db import models

class Ship(models.Model):
    CARGO_TYPES = [
        ('cargo ship', 'Cargo Ship'),
        ('passenger ship', 'Passenger Ship'),
        ('military ship', 'Military Ship'),
        ('icebreaker', 'Icebreaker'),
        ('fishing vessel', 'Fishing Vessel'),
        ('barge ship', 'Barge Ship'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('under maintenance', 'Under Maintenance'),
        ('decommissioned', 'Decommissioned'),
    ]

    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=200, unique=True)
    capacity_in_tonnes = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=50, choices=CARGO_TYPES, default='cargo ship')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.registration_number})"
