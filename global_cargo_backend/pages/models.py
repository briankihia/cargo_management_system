from django.db import models
from django.core.validators import MinValueValidator

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



class Cargo(models.Model):
    CARGO_TYPES = [
        ('perishable', 'Perishable'),
        ('dangerous', 'Dangerous'),
        ('general', 'General'),
        ('other', 'Other'),
    ]

    description = models.TextField(blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    volume = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # client: nullable, set NULL on delete to preserve historical shipments
    client = models.ForeignKey(
    'Client',  # or just Client without quotes if defined above
    null=True,
    blank=True,
    on_delete=models.SET_NULL,
    related_name='cargo_items'
)

    cargo_type = models.CharField(max_length=20, choices=CARGO_TYPES, default='general')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Cargo #{self.id} ({self.cargo_type}) - {self.weight} kg"


class Crew(models.Model):
    ROLE_CHOICES = [
        ('Captain', 'Captain'),
        ('Chief Officer', 'Chief Officer'),
        ('Able Seaman', 'Able Seaman'),
        ('Ordinary Seaman', 'Ordinary Seaman'),
        ('Engine Cadet', 'Engine Cadet'),
        ('Radio Officer', 'Radio Officer'),
        ('Chief Cook', 'Chief Cook'),
        ('Steward', 'Steward'),
        ('Deckhand', 'Deckhand'),
    ]

    ship = models.ForeignKey('Ship', null=True, blank=True, on_delete=models.SET_NULL, related_name='crew')
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='Captain')
    phone_number = models.CharField(max_length=30, unique=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class Client(models.Model):
    company_name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    address = models.CharField(max_length=200)
    registered_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.company_name
    

class Port(models.Model):
    port_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    capacity = models.IntegerField()
    contact_email = models.EmailField()

    def __str__(self):
        return self.port_name