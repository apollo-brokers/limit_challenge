from rest_framework import viewsets

from maintenance.models import MaintenanceRecord, Mechanic
from maintenance.serializers import MaintenanceRecordSerializer, MechanicSerializer


class MechanicViewSet(viewsets.ModelViewSet):
    queryset = Mechanic.objects.order_by("id")
    serializer_class = MechanicSerializer

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.order_by("id")
    serializer_class = MaintenanceRecordSerializer
