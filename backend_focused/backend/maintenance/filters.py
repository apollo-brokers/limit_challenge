from django_filters import rest_framework as filters

from maintenance.models import MaintenanceRecord


class MaintenanceRecordFilter(filters.FilterSet):
    vehicle = filters.NumberFilter(field_name="vehicle_id")
    mechanic = filters.NumberFilter(field_name="mechanic_id")
    maintenance_date = filters.DateFromToRangeFilter()

    class Meta:
        model = MaintenanceRecord
        fields = []
