from rest_framework import serializers

from offices.models import Office


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = "__all__"


class OfficeSummarySerializer(serializers.Serializer):
    name = serializers.CharField()
    city = serializers.CharField()
    active_vehicle_count = serializers.IntegerField()
    maintenance_cost_last_year = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )
    last_maintenance = serializers.DateField(allow_null=True)
