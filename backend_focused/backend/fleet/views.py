from rest_framework import viewsets

from fleet.models import Vehicle
from fleet.serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.order_by("id")
    serializer_class = VehicleSerializer
