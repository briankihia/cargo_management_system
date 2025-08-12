from django.shortcuts import render

from rest_framework import viewsets, filters
from .models import Ship, Cargo, Crew, Client, Port
from .serializers import ShipSerializer, CargoSerializer, CrewSerializer, ClientSerializer, PortSerializer
from rest_framework.permissions import IsAuthenticated

class ShipViewSet(viewsets.ModelViewSet):
    queryset = Ship.objects.all()
    serializer_class = ShipSerializer
    permission_classes = [IsAuthenticated]


class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'cargo_type', 'client__first_name', 'client__last_name']
    ordering_fields = ['weight', 'created_at']



class CrewViewSet(viewsets.ModelViewSet):
    queryset = Crew.objects.select_related('ship').all()
    serializer_class = CrewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'role', 'ship__name']
    ordering_fields = ['last_name', 'created_at']


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-registered_date')
    serializer_class = ClientSerializer


class PortViewSet(viewsets.ModelViewSet):
    queryset = Port.objects.all()
    serializer_class = PortSerializer