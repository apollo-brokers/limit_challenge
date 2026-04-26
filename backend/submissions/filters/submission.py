import django_filters
from django.db.models import Q

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=models.Submission.Status.choices)
    priority = django_filters.ChoiceFilter(choices=models.Submission.Priority.choices)
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(method="filter_company_search")
    createdFrom = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    createdTo = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")

    class Meta:
        model = models.Submission
        fields = [
            "status",
            "priority",
            "brokerId",
            "companySearch",
            "createdFrom",
            "createdTo",
            "hasDocuments",
            "hasNotes",
        ]

    def filter_company_search(self, queryset, name, value):
        term = (value or "").strip()
        if not term:
            return queryset

        return queryset.filter(
            Q(company__legal_name__icontains=term)
            | Q(company__industry__icontains=term)
            | Q(company__headquarters_city__icontains=term)
        )

    def filter_has_documents(self, queryset, name, value):
        if value is None:
            return queryset
        if value:
            return queryset.filter(documents__isnull=False).distinct()
        return queryset.filter(documents__isnull=True)

    def filter_has_notes(self, queryset, name, value):
        if value is None:
            return queryset
        if value:
            return queryset.filter(notes__isnull=False).distinct()
        return queryset.filter(notes__isnull=True)
