from django.db.models import Prefetch
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from fleet.filters import VehicleFilter
from fleet.models import Vehicle
from fleet.serializers import (
    VehicleAssignmentSerializer,
    VehicleDetailSerializer,
    VehicleSerializer,
)
from fleet.services import VehicleService
from maintenance.models import MaintenanceRecord
from maintenance.serializers import MaintenanceRecordSerializer


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

    @action(
        detail=True,
        methods=["get"],
        url_path="maintenance-history",
        serializer_class=MaintenanceRecordSerializer,
    )
    def maintenance_history(self, request, pk=None):
        vehicle = self.get_object()
        maintenance_records = vehicle.maintenance_records.order_by(
            "-maintenance_date",
            "-id",
        )

        page = self.paginate_queryset(maintenance_records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(maintenance_records, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        url_path="assign-office",
        serializer_class=VehicleAssignmentSerializer,
    )
    def assign_office(self, request, pk=None):
        vehicle = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle_service = VehicleService()
        vehicle_service.assign_office(
            vehicle=vehicle,
            office=serializer.validated_data["office"],
        )

        return Response(VehicleSerializer(vehicle).data)
