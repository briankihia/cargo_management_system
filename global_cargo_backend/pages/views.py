from django.shortcuts import render

from rest_framework import viewsets
from .models import Ship
from .serializers import ShipSerializer
from rest_framework.permissions import IsAuthenticated

class ShipViewSet(viewsets.ModelViewSet):
    queryset = Ship.objects.all()
    serializer_class = ShipSerializer
    permission_classes = [IsAuthenticated]
