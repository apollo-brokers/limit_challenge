from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
    inline_serializer,
)
from rest_framework import serializers, viewsets

from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
)
from fleet.serializers import (
    MaintenanceRecordSerializer,
    MaintenanceTypeSerializer,
    MechanicSerializer,
    OfficeSerializer,
    VehicleSerializer,
)

protected_destroy_schema = extend_schema_view(
    destroy=extend_schema(
        responses={
            204: None,
            409: OpenApiResponse(
                response=inline_serializer(
                    name="ProtectedDeleteError",
                    fields={"detail": serializers.CharField()},
                ),
                description="The object is referenced by other records and cannot be deleted.",
            ),
        },
    ),
)


@protected_destroy_schema
class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.order_by("name", "id")
    serializer_class = OfficeSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.select_related("office").order_by("id")
    serializer_class = VehicleSerializer


@protected_destroy_schema
class MechanicViewSet(viewsets.ModelViewSet):
    queryset = Mechanic.objects.order_by("name", "id")
    serializer_class = MechanicSerializer


@protected_destroy_schema
class MaintenanceTypeViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceType.objects.order_by("name", "id")
    serializer_class = MaintenanceTypeSerializer


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related(
        "vehicle",
        "mechanic",
        "type",
    )
    serializer_class = MaintenanceRecordSerializer
