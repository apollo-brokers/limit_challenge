import django_filters
from django.db.models import Exists, OuterRef

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """Filter helpers for submission list exploration."""

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    broker_id = django_filters.NumberFilter(field_name="broker_id")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    company_search = django_filters.CharFilter(method="filter_company_search")
    companySearch = django_filters.CharFilter(method="filter_company_search")
    created_from = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    createdFrom = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    created_to = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    createdTo = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    has_documents = django_filters.BooleanFilter(method="filter_has_documents")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    has_notes = django_filters.BooleanFilter(method="filter_has_notes")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")

    def filter_company_search(self, queryset, _name, value):
        if not value:
            return queryset
        return queryset.filter(company__legal_name__icontains=value)

    def filter_has_documents(self, queryset, _name, value):
        if value is None:
            return queryset

        documents = models.Document.objects.filter(submission_id=OuterRef("pk"))
        queryset = queryset.annotate(_has_documents=Exists(documents))
        return queryset.filter(_has_documents=value)

    def filter_has_notes(self, queryset, _name, value):
        if value is None:
            return queryset

        notes = models.Note.objects.filter(submission_id=OuterRef("pk"))
        queryset = queryset.annotate(_has_notes=Exists(notes))
        return queryset.filter(_has_notes=value)

    class Meta:
        model = models.Submission
        fields = [
            "status",
            "broker_id",
            "brokerId",
            "company_search",
            "companySearch",
            "created_from",
            "createdFrom",
            "created_to",
            "createdTo",
            "has_documents",
            "hasDocuments",
            "has_notes",
            "hasNotes",
        ]

