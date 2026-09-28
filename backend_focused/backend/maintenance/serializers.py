from rest_framework import serializers

from maintenance.models import MaintenanceRecord, Mechanic


class MechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanic
        fields = "__all__"


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = "__all__"


class MaintenanceRecordDetailSerializer(serializers.ModelSerializer):
    mechanic = MechanicSerializer(read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = "__all__"
