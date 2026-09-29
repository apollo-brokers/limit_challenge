from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from maintenance.models import MaintenanceRecord, Mechanic
from maintenance.querysets import MechanicQuerySet
from maintenance.serializers import (
    MaintenanceRecordSerializer,
    MechanicSerializer,
    MechanicWorkloadSerializer,
)


@extend_schema(tags=["Mechanics"])
class MechanicViewSet(viewsets.ModelViewSet):
    queryset = Mechanic.objects.order_by("id")
    serializer_class = MechanicSerializer

    @action(
        detail=False,
        methods=["get"],
        serializer_class=MechanicWorkloadSerializer,
    )
    def workload(self, request):
        mechanics: MechanicQuerySet = Mechanic.objects.all()
        mechanics = mechanics.with_workload(year=timezone.localdate().year)

        serializer = self.get_serializer(mechanics, many=True)
        return Response(serializer.data)


@extend_schema(tags=["Maintenance Records"])
class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.order_by("id")
    serializer_class = MaintenanceRecordSerializer
