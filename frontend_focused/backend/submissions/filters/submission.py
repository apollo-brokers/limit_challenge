import datetime

import django_filters
from django.db.models import Q

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(method="filter_company_search")
    createdFrom = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    createdTo = django_filters.DateTimeFilter(method="filter_created_to")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")

    class Meta:
        model = models.Submission
        fields = ["status"]

    def filter_company_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(company__legal_name__icontains=value)
            | Q(company__industry__icontains=value)
            | Q(company__headquarters_city__icontains=value)
        )

    def filter_created_to(self, queryset, name, value):
        if not value:
            return queryset
        if value.time() == datetime.time.min:
            value = value + datetime.timedelta(days=1) - datetime.timedelta(microseconds=1)
        return queryset.filter(created_at__lte=value)

    def filter_has_documents(self, queryset, name, value):
        if value is None:
            return queryset
        if value:
            return queryset.filter(document_count__gt=0)
        return queryset.filter(document_count=0)

    def filter_has_notes(self, queryset, name, value):
        if value is None:
            return queryset
        if value:
            return queryset.filter(note_count__gt=0)
        return queryset.filter(note_count=0)
