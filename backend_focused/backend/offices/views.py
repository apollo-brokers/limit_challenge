from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, Max, Q, Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from offices.models import Office
from offices.serializers import OfficeSerializer, OfficeSummarySerializer


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.order_by("id")
    serializer_class = OfficeSerializer

    @action(
        detail=False,
        methods=["get"],
        serializer_class=OfficeSummarySerializer,
    )
    def summary(self, request):
        maintenance_cutoff = timezone.localdate() - timedelta(days=365)
        maintenance_last_year = Q(
            vehicles__maintenance_records__maintenance_date__gte=maintenance_cutoff
        )

        offices = Office.objects.annotate(
            active_vehicle_count=Count(
                "vehicles",
                filter=Q(vehicles__active=True),
                distinct=True,
            ),
            maintenance_cost_last_year=Sum(
                "vehicles__maintenance_records__cost",
                filter=maintenance_last_year,
                default=Decimal("0.00"),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            ),
            last_maintenance=Max("vehicles__maintenance_records__maintenance_date"),
        ).order_by("id")

        serializer = self.get_serializer(offices, many=True)
        return Response(serializer.data)
