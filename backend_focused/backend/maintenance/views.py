from decimal import Decimal

from django.db.models import Count, DecimalField, Q, Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from maintenance.models import MaintenanceRecord, Mechanic
from maintenance.serializers import (
    MaintenanceRecordSerializer,
    MechanicSerializer,
    MechanicWorkloadSerializer,
)


class MechanicViewSet(viewsets.ModelViewSet):
    queryset = Mechanic.objects.order_by("id")
    serializer_class = MechanicSerializer

    @action(
        detail=False,
        methods=["get"],
        serializer_class=MechanicWorkloadSerializer,
    )
    def workload(self, request):
        current_year_records = Q(
            maintenance_records__maintenance_date__year=timezone.localdate().year
        )
        mechanics = Mechanic.objects.annotate(
            maintenance_count=Count(
                "maintenance_records",
                filter=current_year_records,
            ),
            total_maintenance_cost=Sum(
                "maintenance_records__cost",
                filter=current_year_records,
                default=Decimal("0.00"),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            ),
        ).order_by("-maintenance_count", "id")

        serializer = self.get_serializer(mechanics, many=True)
        return Response(serializer.data)


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.order_by("id")
    serializer_class = MaintenanceRecordSerializer
