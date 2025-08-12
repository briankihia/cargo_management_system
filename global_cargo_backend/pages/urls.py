from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShipViewSet, CargoViewSet, CrewViewSet, ClientViewSet, PortViewSet

router = DefaultRouter()
router.register(r'ships', ShipViewSet)
router.register(r'cargo', CargoViewSet, basename='cargo')
router.register(r'crew', CrewViewSet, basename='crew')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'ports', PortViewSet, basename='port')

urlpatterns = [
    path('', include(router.urls)),
]
