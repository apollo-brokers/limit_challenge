from rest_framework import viewsets

from offices.models import Office
from offices.serializers import OfficeSerializer


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.order_by("id")
    serializer_class = OfficeSerializer
