import django_filters
from django.db.models import QuerySet

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """
    Advanced filter set for the submissions list endpoint.
    
    Provides highly specific filters for operations teams, including 
    status, relational IDs, partial string searching, date bounding, 
    and boolean attachment checks.
    """

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact", help_text="Exact match for a given submission status.")
    brokerId = django_filters.NumberFilter(field_name="broker_id", help_text="Filter exact broker by integer ID.")
    companySearch = django_filters.CharFilter(field_name="company__legal_name", lookup_expr="icontains", help_text="Case-insensitive partial match on Company legal name.")
    
    # Date Filtering
    createdFrom = django_filters.DateFilter(field_name="created_at", lookup_expr="gte", help_text="Submissions created on or after this date (YYYY-MM-DD).")
    createdTo = django_filters.DateFilter(field_name="created_at", lookup_expr="lte", help_text="Submissions created on or before this date (YYYY-MM-DD).")

    # Attachment Metadata Filtering
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents", help_text="Filter for submissions that contain at least one document.")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes", help_text="Filter for submissions that contain at least one note.")

    class Meta:
        model = models.Submission
        fields = ["status", "brokerId", "companySearch", "createdFrom", "createdTo", "hasDocuments", "hasNotes"]

    def filter_has_documents(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        """
        Applies a filter based on the presence of documents.
        Relies on the 'document_count' annotation appended via the SubmissionQuerySet manager.
        """
        if value:
            return queryset.filter(document_count__gt=0)
        return queryset.filter(document_count=0)

    def filter_has_notes(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        """
        Applies a filter based on the presence of threaded notes.
        Relies on the 'note_count' annotation appended via the SubmissionQuerySet manager.
        """
        if value:
            return queryset.filter(note_count__gt=0)
        return queryset.filter(note_count=0)

