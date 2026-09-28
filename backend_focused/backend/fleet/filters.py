from django_filters import rest_framework as filters

from fleet.models import Vehicle


class VehicleFilter(filters.FilterSet):
    office = filters.NumberFilter(field_name="office_id")
    active = filters.BooleanFilter()
    make = filters.CharFilter(lookup_expr="iexact")
    model = filters.CharFilter(lookup_expr="iexact")
    maintenance_date = filters.DateFromToRangeFilter(
        method="filter_maintenance_date",
    )
    mechanic_certification_number = filters.CharFilter(
        method="filter_mechanic_certification_number",
    )

    class Meta:
        model = Vehicle
        fields = []

    def filter_maintenance_date(self, queryset, name, value):
        date_filters = {}

        if value.start:
            date_filters["maintenance_records__maintenance_date__gte"] = (
                value.start.date()
            )

        if value.stop:
            date_filters["maintenance_records__maintenance_date__lte"] = (
                value.stop.date()
            )

        return queryset.filter(**date_filters).distinct()

    def filter_mechanic_certification_number(self, queryset, name, value):
        return queryset.filter(
            maintenance_records__mechanic__certification_number__iexact=value,
        ).distinct()
