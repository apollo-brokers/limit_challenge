import django_filters
from django.db.models import Q

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """Basic filter set for the submissions list endpoint.

    Only the status filter is implemented so the candidate can extend the
    remaining filters (broker, company search, optional extras, etc.).
    """

    """
    Supports filtering by status, broker, company search, and optional date ranges
    and document/note presence filters.
    """

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")

    broker_id = django_filters.NumberFilter(field_name="broker_id", lookup_expr="exact")

    company_search = django_filters.CharFilter(
        method="filter_company_search",
        label="Company search (name or industry)"
    )

    created_from = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="gte"
    )

    created_to = django_filters.DateTimeFilter(
        field_name="created_at",
        lookup_expr="lte"
    )

    has_documents = django_filters.BooleanFilter(method="filter_has_documents")
    has_notes = django_filters.BooleanFilter(method="filter_has_notes")

    class Meta:
        model = models.Submission
        fields = [
            "status",
            "broker_id",
            "company_search",
            "created_from",
            "created_to",
            "has_documents",
            "has_notes"
        ]

    def filter_company_search(self, queryset, name, value):
        """Search for company by legal name or industry."""
        if not value:
            return queryset
        return queryset.filter(
            Q(company__legal_name__icontains=value) |
            Q(company__industry__icontains=value)
        )

    def filter_has_documents(self, queryset, name, value):
        """Filter submissions by presence of documents."""
        if value is True:
            return queryset.filter(documents__isnull=False).distinct()
        elif value is False:
            return queryset.filter(documents__isnull=True)
        return queryset

    def filter_has_notes(self, queryset, name, value):
        """Filter submissions by presence of notes."""
        if value is True:
            return queryset.filter(notes__isnull=False).distinct()
        elif value is False:
            return queryset.filter(notes__isnull=True)
        return queryset

