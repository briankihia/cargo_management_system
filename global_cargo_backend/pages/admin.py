from django.contrib import admin
from .models import Cargo, Crew

@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cargo_type', 'weight', 'client', 'is_active', 'created_at')
    list_filter = ('cargo_type', 'is_active')
    search_fields = ('description', 'client__first_name', 'client__last_name')



@admin.register(Crew)
class CrewAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'role', 'ship', 'phone_number', 'is_active')
    list_filter = ('role', 'is_active', 'nationality')
    search_fields = ('first_name', 'last_name', 'phone_number', 'ship__name')