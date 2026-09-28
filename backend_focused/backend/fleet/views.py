from django.db.models import Prefetch
from rest_framework import viewsets

from fleet.filters import VehicleFilter
from fleet.models import Vehicle
from fleet.serializers import VehicleDetailSerializer, VehicleSerializer
from maintenance.models import MaintenanceRecord


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.order_by("id")
    serializer_class = VehicleSerializer
    filterset_class = VehicleFilter

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.action == "retrieve":
            return queryset.select_related("office").prefetch_related(
                Prefetch(
                    "maintenance_records",
                    queryset=MaintenanceRecord.objects.select_related("mechanic"),
                )
            )
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VehicleDetailSerializer

        return super().get_serializer_class()
