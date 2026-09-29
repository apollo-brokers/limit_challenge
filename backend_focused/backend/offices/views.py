from datetime import timedelta

from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from offices.models import Office
from offices.querysets import OfficeQuerySet
from offices.serializers import OfficeSerializer, OfficeSummarySerializer


@extend_schema(tags=["Offices"])
class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.order_by("id")
    serializer_class = OfficeSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "city"]

    @extend_schema(responses=OfficeSummarySerializer(many=True), filters=False)
    @action(
        detail=False,
        methods=["get"],
        serializer_class=OfficeSummarySerializer,
        pagination_class=None,
        filter_backends=[],
    )
    def summary(self, request):
        maintenance_cutoff = timezone.localdate() - timedelta(days=365)
        offices: OfficeQuerySet = Office.objects.all()
        offices = offices.with_summary(maintenance_since=maintenance_cutoff)

        serializer = self.get_serializer(offices, many=True)
        return Response(serializer.data)
