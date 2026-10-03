import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """Filter set for the submissions list endpoint.

    Query param names are camelCase on purpose: djangorestframework-camel-case
    does not rewrite URL query params, and the frontend sends brokerId /
    companySearch / createdFrom / createdTo.
    """

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(
        field_name="company__legal_name", lookup_expr="icontains"
    )
    priority = django_filters.CharFilter(field_name="priority", lookup_expr="iexact")
    createdFrom = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    createdTo = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")

    class Meta:
        model = models.Submission
        fields = [
            "status",
            "brokerId",
            "companySearch",
            "priority",
            "createdFrom",
            "createdTo",
        ]
