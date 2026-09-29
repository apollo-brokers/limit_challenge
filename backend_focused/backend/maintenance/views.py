from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from maintenance.filters import MaintenanceRecordFilter
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
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["active"]
    search_fields = ["name", "certification_number"]

    @extend_schema(responses=MechanicWorkloadSerializer(many=True), filters=False)
    @action(
        detail=False,
        methods=["get"],
        serializer_class=MechanicWorkloadSerializer,
        pagination_class=None,
        filter_backends=[],
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
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = MaintenanceRecordFilter
    search_fields = [
        "maintenance_type",
        "notes",
        "vehicle__license_plate",
        "vehicle__vin",
        "mechanic__name",
    ]
