from rest_framework import viewsets

from submissions import models, serializers
from submissions.filters.submission import SubmissionFilterSet


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Submissions.
    
    Provides `list` and `retrieve` actions. Uses a custom QuerySet manager
    to fetch aggregated data (document/note counts, latest note) in a heavily
    optimized single-query sequence to prevent N+1 issues.
    """
    queryset = models.Submission.objects.all()
    filterset_class = SubmissionFilterSet

    def get_queryset(self):
        """
        Dynamically adjusts the queryset based on the action context.
        List action fetches custom annotations. Retrieve action prefetches relationships.
        """
        queryset = super().get_queryset()

        if self.action == "list":
            # Leverage the custom manager to aggregate related models securely
            queryset = queryset.with_counts_and_previews()
        elif self.action == "retrieve":
            # Prefetch full relationships for the detail view to prevent N+1
            queryset = queryset.select_related("company", "broker", "owner").prefetch_related("contacts", "documents", "notes")

        return queryset

    def get_serializer_class(self):
        """
        Return appropriate serializer class depending on action geometry.
        """
        if self.action == "list":
            return serializers.SubmissionListSerializer
        return serializers.SubmissionDetailSerializer


class BrokerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Brokers to populate dropdown selector menus.
    """
    queryset = models.Broker.objects.all()
    serializer_class = serializers.BrokerSerializer

